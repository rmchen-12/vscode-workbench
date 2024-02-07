export declare const services: any;

type RenderCallback = () => Promise<void> | void;

interface App {
  open(render: RenderCallback): Promise<void>;
}

export declare const app: App;
