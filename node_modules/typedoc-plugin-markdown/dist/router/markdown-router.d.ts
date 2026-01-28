import { BaseRouter, PageDefinition, ProjectReflection, Reflection, ReflectionKind, RouterTarget } from 'typedoc';
export declare abstract class MarkdownRouter extends BaseRouter {
    extension: string;
    outputFileStrategy: "members" | "modules";
    entryModule: string;
    ignoreScopes: boolean;
    modulesFileName: string;
    entryFileName: string;
    isPackages: boolean;
    membersWithOwnFile: ("Variable" | "Function" | "Class" | "Interface" | "Enum" | "TypeAlias")[];
    mergeReadme: boolean;
    anchorPrefix: string;
    directories: Map<ReflectionKind, string>;
    kindsToString: Map<ReflectionKind, string>;
    buildPages(project: ProjectReflection): PageDefinition<RouterTarget>[];
    getAnchor(target: RouterTarget): string | undefined;
    private parseChildPages;
    getIdealBaseNameFlattened(reflection: Reflection): string;
    getReflectionAlias(reflection: Reflection): string;
    getModulesFileName(reflection: Reflection): string;
}
