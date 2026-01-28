import { isQuoted } from '../../libs/utils/index.js';
import { getHierarchyRoots, isNoneSection, sortNoneSectionFirst, } from '../../theme/lib/index.js';
import { DeclarationReflection, EntryPointStrategy, i18n, ReflectionKind, } from 'typedoc';
export class NavigationBuilder {
    router;
    theme;
    project;
    options;
    packagesMeta;
    navigationOptions;
    navigation = [];
    isPackages;
    includeHierarchySummary;
    fileExtension;
    constructor(router, theme, project) {
        this.router = router;
        this.theme = theme;
        this.project = project;
        this.options = theme.application.options;
        this.navigationOptions = this.getNavigationOptions();
        this.packagesMeta = {};
        this.packagesMeta = theme.application.renderer.packagesMeta;
        this.navigation = [];
        this.isPackages =
            this.options.getValue('entryPointStrategy') ===
                EntryPointStrategy.Packages;
        this.includeHierarchySummary =
            this.options.isSet('includeHierarchySummary') &&
                this.options.getValue('includeHierarchySummary');
        this.fileExtension = this.options.getValue('fileExtension');
    }
    getNavigation() {
        if (this.isPackages) {
            if (Object.keys(this.packagesMeta)?.length === 1) {
                this.buildNavigationFromProject(this.project);
            }
            else {
                this.project.children?.forEach((projectChild) => {
                    this.buildNavigationFromPackage(projectChild);
                });
            }
        }
        else {
            this.buildNavigationFromProject(this.project);
        }
        this.removeEmptyChildren(this.navigation);
        return this.navigation;
    }
    getNavigationOptions() {
        if (this.options.isSet('navigation')) {
            const navigationOptions = this.options.getValue('navigation');
            return {
                excludeCategories: !navigationOptions.includeCategories,
                excludeGroups: !navigationOptions.includeGroups,
                excludeFolders: !navigationOptions.includeFolders,
            };
        }
        return this.options.getValue('navigationModel');
    }
    removeEmptyChildren(navigation) {
        navigation.forEach((navItem) => {
            if (navItem.children) {
                this.removeEmptyChildren(navItem.children);
                navItem.children = navItem.children.filter((child) => Object.keys(child).length > 0);
                if (navItem.children.length === 0) {
                    delete navItem.children;
                }
            }
        });
    }
    buildNavigationFromPackage(projectChild) {
        const packageOptions = this.packagesMeta[projectChild.name]?.options;
        const entryModule = packageOptions?.isSet('entryModule')
            ? packageOptions.getValue('entryModule')
            : this.options.getValue('entryModule');
        const projectChildUrl = this.router.getFullUrl(projectChild);
        const children = [];
        const childGroups = this.getReflectionGroups(projectChild);
        if (childGroups) {
            children.push(...childGroups.filter((child) => child.title !== entryModule));
        }
        this.navigation.push({
            title: projectChild.name,
            kind: projectChild.kind,
            children,
            ...(projectChildUrl && { path: projectChildUrl }),
        });
    }
    buildNavigationFromProject(project) {
        const entryModule = this.options.getValue('entryModule');
        if (this.includeHierarchySummary &&
            getHierarchyRoots(project)?.length) {
            this.navigation.push({
                title: i18n.theme_hierarchy(),
                path: `hierarchy${this.fileExtension}`,
            });
        }
        if (!this.navigationOptions.excludeCategories &&
            project.categories?.length) {
            this.navigation.push(...project.categories.map((category) => {
                return {
                    title: category.title,
                    ...(this.router.hasUrl(category) && {
                        path: this.router.getFullUrl(category),
                    }),
                    children: this.getCategoryGroupChildren(category),
                };
            }));
        }
        else {
            if (project.groups?.length) {
                const isOnlyModules = project.children?.every((child) => child.kind === ReflectionKind.Module);
                if (isOnlyModules) {
                    project.groups?.forEach((projectGroup) => {
                        const children = this.getGroupChildren(projectGroup);
                        if (projectGroup.title === i18n.kind_plural_module()) {
                            if (children?.length) {
                                this.navigation.push(...children.filter((child) => child.title !== entryModule));
                            }
                        }
                        else {
                            if (this.navigationOptions.excludeGroups) {
                                if (children?.length) {
                                    this.navigation.push(...children.filter((child) => child.title !== entryModule));
                                }
                            }
                            else {
                                if (projectGroup.owningReflection.kind === ReflectionKind.Document) {
                                    this.navigation.push({
                                        title: projectGroup.title,
                                        children: projectGroup.children.map((child) => {
                                            return {
                                                title: child.name,
                                                kind: child.kind,
                                                path: this.router.getFullUrl(child),
                                                isDeprecated: child.isDeprecated(),
                                            };
                                        }),
                                    });
                                }
                                else {
                                    this.navigation.push({
                                        title: projectGroup.title,
                                        children: children?.filter((child) => child.title !== entryModule),
                                    });
                                }
                            }
                        }
                    });
                }
                else {
                    project.groups?.forEach((projectGroup) => {
                        const children = this.getGroupChildren(projectGroup);
                        const indexModule = projectGroup.children.find((child) => child.name === entryModule);
                        if (children?.length) {
                            this.navigation.push({
                                title: projectGroup.title,
                                children: children.filter((child) => child.title !== entryModule),
                            });
                        }
                        if (indexModule) {
                            const children = indexModule instanceof DeclarationReflection
                                ? this.getReflectionGroups(indexModule)
                                : [];
                            if (children) {
                                this.navigation.push(...children);
                            }
                        }
                    });
                }
            }
        }
    }
    getCategoryGroupChildren(group) {
        return group.children
            ?.filter((child) => this.router.hasOwnDocument(child))
            .map((child) => {
            const children = child instanceof DeclarationReflection
                ? this.getReflectionGroups(child)
                : [];
            return {
                title: child.name,
                kind: child.kind,
                path: this.router.getFullUrl(child),
                isDeprecated: child.isDeprecated(),
                ...(children && { children }),
            };
        });
    }
    getGroupChildren(group) {
        if (!this.navigationOptions.excludeCategories &&
            group?.categories?.length) {
            return group.categories?.map((category) => {
                return {
                    title: category.title,
                    children: this.getCategoryGroupChildren(category),
                };
            });
        }
        return group.children
            ?.filter((child) => this.router.hasOwnDocument(child))
            .reduce((acc, child) => {
            const children = child instanceof DeclarationReflection &&
                !this.navigationOptions.excludeCategories &&
                child.categories?.length
                ? child.categories
                    .sort(sortNoneSectionFirst)
                    ?.flatMap((category) => {
                    const catChildren = this.getCategoryGroupChildren(category);
                    return catChildren.length
                        ? isNoneSection(category)
                            ? catChildren
                            : {
                                title: category.title,
                                ...(this.router.hasUrl(category) && {
                                    path: this.router.getFullUrl(category),
                                }),
                                children: catChildren,
                            }
                        : [];
                })
                    .filter((cat) => Boolean(cat))
                : this.getReflectionGroups(child);
            return this.processChildren(acc, child, children);
        }, []);
    }
    getReflectionGroups(reflection, outputFileStrategy) {
        if (reflection instanceof DeclarationReflection) {
            if (this.navigationOptions.excludeGroups) {
                return reflection.childrenIncludingDocuments
                    ?.filter((child) => this.router.hasOwnDocument(child))
                    .reduce((acc, child) => {
                    const children = this.getReflectionGroups(child, outputFileStrategy);
                    return this.processChildren(acc, child, children);
                }, []);
            }
            const groupsWithOwnFilesOnly = reflection.groups?.filter((group) => {
                return group.children.every((child) => this.router.hasOwnDocument(child));
            });
            if (groupsWithOwnFilesOnly?.length === 1 &&
                groupsWithOwnFilesOnly[0].children.every((child) => child.kind === ReflectionKind.Module)) {
                return this.getGroupChildren(groupsWithOwnFilesOnly[0]);
            }
            return reflection.groups?.sort(sortNoneSectionFirst)?.flatMap((group) => {
                const groupChildren = this.getGroupChildren(group);
                if (groupChildren?.length) {
                    if (group.owningReflection.kind === ReflectionKind.Document) {
                        return groupChildren[0];
                    }
                    if (isNoneSection(group)) {
                        return groupChildren;
                    }
                    return {
                        title: group.title,
                        children: groupChildren,
                    };
                }
                return [];
            });
        }
        return null;
    }
    processChildren(acc, child, children) {
        if (!isQuoted(child.name) && !this.navigationOptions.excludeFolders) {
            const titleParts = child.name.split('/');
            if (!child.name.startsWith('@') && titleParts.length > 1) {
                let currentLevel = acc;
                let currentItem;
                for (let i = 0; i < titleParts.length - 1; i++) {
                    currentItem = currentLevel?.find((item) => item.title === titleParts[i]);
                    if (!currentItem) {
                        currentItem = {
                            title: titleParts[i],
                            children: [],
                        };
                        currentLevel.push(currentItem);
                    }
                    if (currentItem) {
                        currentLevel = currentItem.children || [];
                    }
                }
                currentLevel.push({
                    title: titleParts[titleParts.length - 1],
                    kind: child.kind,
                    path: this.router.getFullUrl(child),
                    isDeprecated: child.isDeprecated(),
                    ...(children && { children }),
                });
                return acc;
            }
        }
        acc.push({
            title: child.name,
            kind: child.kind,
            path: this.router.getFullUrl(child),
            isDeprecated: child.isDeprecated(),
            ...(children && { children }),
        });
        return acc;
    }
}
