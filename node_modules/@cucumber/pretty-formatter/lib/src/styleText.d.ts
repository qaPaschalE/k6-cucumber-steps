import { BackgroundColor, ForegroundColor, Modifier } from 'ansi-styles';
export declare type TextStyle = keyof BackgroundColor | keyof ForegroundColor | keyof Modifier;
export declare const styleText: (text: string, ...styles: TextStyle[]) => string;
//# sourceMappingURL=styleText.d.ts.map