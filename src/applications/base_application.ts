/**
 * BaseApplication is the abstract base class for applications.
 * An application can execute code on each frame by implementing the `mainLoop` method
 * and can receive keyboard events by implementing the `keyboardHandler` method.
 */
export abstract class BaseApplication {
    public running: boolean;
    private name: string;
    private version: string;
    private description: string;

    /**
     * Applications extending BaseApplication can define their own constructor,
     * but must ensure that they also run BaseApplication's constructor.
     * @protected
     * @param {string} name
     * @param {string} version
     * @param {string} description
     */
    protected constructor(name: string, version: string, description: string) {
        this.name = name;
        this.version = version;
        this.description = description;
        this.running = false;
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getVersion(): string {
        return this.version;
    }

    public close() {
        this.running = false;
    }

    /**
     * Applications extending BaseApplication should not override `run`.
     */
    async run() {
        console.log('inside application.run');

        while (this.running) {
            await this.mainLoop();

            await new Promise((resolve) => {
                requestAnimationFrame(resolve);
            });
        }
    }

    /**
     * mainLoop is called once per frame the entire time the application is running
     */
    abstract mainLoop(): Promise<void>

    /**
     * keyboardHandler is called whenever a keyboard event occurs
     */
    abstract keyboardHandler(e: KeyboardEvent): Promise<void>
}
