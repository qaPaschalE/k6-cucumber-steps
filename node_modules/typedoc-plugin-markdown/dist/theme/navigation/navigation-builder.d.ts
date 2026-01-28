import { MarkdownTheme } from '../../theme/index.js';
import { NavigationItem } from '../../types/index.js';
import { ProjectReflection, Router } from 'typedoc';
export declare class NavigationBuilder {
    router: Router;
    theme: MarkdownTheme;
    project: ProjectReflection;
    private options;
    private packagesMeta;
    private navigationOptions;
    private navigation;
    private isPackages;
    private includeHierarchySummary;
    private fileExtension;
    constructor(router: Router, theme: MarkdownTheme, project: ProjectReflection);
    getNavigation(): NavigationItem[];
    private getNavigationOptions;
    private removeEmptyChildren;
    private buildNavigationFromPackage;
    private buildNavigationFromProject;
    private getCategoryGroupChildren;
    private getGroupChildren;
    private getReflectionGroups;
    private processChildren;
}
