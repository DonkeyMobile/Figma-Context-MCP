import { Transform, Hyperlink, Node, Style, GetFileResponse, GetFileNodesResponse } from '@figma/rest-api-spec';

type CSSRGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;
type CSSHexColor = `#${string}`;
type SimplifiedImageFill = {
    type: "IMAGE";
    imageRef?: string;
    gifRef?: string;
    scaleMode: "FILL" | "FIT" | "TILE" | "STRETCH";
    scalingFactor?: number;
    backgroundSize?: string;
    backgroundRepeat?: string;
    isBackground?: boolean;
    objectFit?: string;
    imageDownloadArguments?: {
        needsCropping: boolean;
        requiresImageDimensions: boolean;
        cropTransform?: Transform;
        filenameSuffix?: string;
    };
};
type SimplifiedGradientFill = {
    type: "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "GRADIENT_ANGULAR" | "GRADIENT_DIAMOND";
    gradient: string;
};
type SimplifiedPatternFill = {
    type: "PATTERN";
    patternSource: {
        type: "IMAGE-PNG";
        nodeId: string;
    };
    backgroundRepeat: string;
    backgroundSize: string;
    backgroundPosition: string;
};
type SimplifiedFill = SimplifiedImageFill | SimplifiedGradientFill | SimplifiedPatternFill | CSSRGBAColor | CSSHexColor;
type SimplifiedStroke = {
    colors: SimplifiedFill[];
    strokeWeight?: string;
    strokeDashes?: number[];
    strokeWeights?: string;
};

type SimplifiedTextStyle = Partial<{
    fontFamily: string;
    fontStyle: string;
    fontWeight: number;
    fontSize: number;
    lineHeight: string;
    letterSpacing: string;
    textCase: string;
    textAlignHorizontal: string;
    textAlignVertical: string;
    italic: boolean;
    textDecoration: "STRIKETHROUGH" | "UNDERLINE" | "NONE";
    hyperlink: Hyperlink;
    opentypeFlags: Record<string, number>;
    paragraphSpacing: number;
    paragraphIndent: number;
    listSpacing: number;
    fills: SimplifiedFill[];
}>;

interface SimplifiedLayout {
    mode: "none" | "row" | "column";
    justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch";
    alignItems?: "flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch";
    alignSelf?: "flex-start" | "flex-end" | "center" | "stretch";
    wrap?: boolean;
    gap?: string;
    locationRelativeToParent?: {
        x: number;
        y: number;
    };
    dimensions?: {
        width?: number;
        height?: number;
        aspectRatio?: number;
    };
    padding?: string;
    sizing?: {
        horizontal?: "fixed" | "fill" | "hug";
        vertical?: "fixed" | "fill" | "hug";
    };
    overflowScroll?: ("x" | "y")[];
    position?: "absolute";
}

type SimplifiedEffects = {
    boxShadow?: string;
    filter?: string;
    backdropFilter?: string;
    textShadow?: string;
};

interface SimplifiedPropertyDefinition {
    type: string;
    defaultValue: boolean | string;
}
interface SimplifiedComponentDefinition {
    id: string;
    key: string;
    name: string;
    componentSetId?: string;
    propertyDefinitions?: Record<string, SimplifiedPropertyDefinition>;
}
interface SimplifiedComponentSetDefinition {
    id: string;
    key: string;
    name: string;
    description?: string;
    propertyDefinitions?: Record<string, SimplifiedPropertyDefinition>;
}

type StyleTypes = SimplifiedTextStyle | SimplifiedFill[] | SimplifiedLayout | SimplifiedStroke | SimplifiedEffects | string;
type GlobalVars = {
    styles: Record<string, StyleTypes>;
};
interface TraversalContext {
    globalVars: GlobalVars;
    extraStyles?: Record<string, Style>;
    currentDepth: number;
    parent?: Node;
    insideComponentDefinition?: boolean;
    traversalState: TraversalState;
    nodeCounter: NodeCounter;
}
type NodeCounter = {
    count: number;
};
interface TraversalState {
    componentPropertyDefinitions: Record<string, Record<string, SimplifiedPropertyDefinition>>;
    tsCounter: number;
}
interface TraversalOptions {
    maxDepth?: number;
    nodeFilter?: (node: Node) => boolean;
    afterChildren?: (node: Node, result: SimplifiedNode, children: SimplifiedNode[]) => SimplifiedNode[];
    nodeCounter?: NodeCounter;
}
type ExtractorFn = (node: Node, result: SimplifiedNode, context: TraversalContext) => void;
interface SimplifiedDesign {
    name: string;
    nodes: SimplifiedNode[];
    components: Record<string, SimplifiedComponentDefinition>;
    componentSets: Record<string, SimplifiedComponentSetDefinition>;
    globalVars: GlobalVars;
}
interface SimplifiedNode {
    id: string;
    name: string;
    type: string;
    text?: string;
    textStyle?: string;
    boldWeight?: number;
    fills?: string;
    styles?: string;
    strokes?: string;
    strokeWeight?: string;
    strokeDashes?: number[];
    strokeWeights?: string;
    effects?: string;
    opacity?: number;
    borderRadius?: string;
    layout?: string;
    componentId?: string;
    componentProperties?: Record<string, boolean | string>;
    componentPropertyReferences?: Record<string, string>;
    children?: SimplifiedNode[];
}

declare function extractFromDesign(nodes: Node[], extractors: ExtractorFn[], options?: TraversalOptions, globalVars?: GlobalVars, extraStyles?: Record<string, Style>): Promise<{
    nodes: SimplifiedNode[];
    globalVars: GlobalVars;
    traversalState: TraversalState;
}>;

declare function simplifyRawFigmaObject(apiResponse: GetFileResponse | GetFileNodesResponse, nodeExtractors: ExtractorFn[], options?: TraversalOptions): Promise<SimplifiedDesign>;

declare const layoutExtractor: ExtractorFn;
declare const textExtractor: ExtractorFn;
declare const visualsExtractor: ExtractorFn;
declare const componentExtractor: ExtractorFn;
declare const allExtractors: ExtractorFn[];
declare const layoutAndText: ExtractorFn[];
declare const contentOnly: ExtractorFn[];
declare const visualsOnly: ExtractorFn[];
declare const layoutOnly: ExtractorFn[];
declare function collapseSvgContainers(node: Node, result: SimplifiedNode, children: SimplifiedNode[]): SimplifiedNode[];

export { type ExtractorFn, type GlobalVars, type SimplifiedDesign, type StyleTypes, type TraversalContext, type TraversalOptions, allExtractors, collapseSvgContainers, componentExtractor, contentOnly, extractFromDesign, layoutAndText, layoutExtractor, layoutOnly, simplifyRawFigmaObject, textExtractor, visualsExtractor, visualsOnly };
