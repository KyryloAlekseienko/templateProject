import { Locator } from "@playwright/test";

export interface VisualSnapshotOptions {
  readonly mask?: Locator[];
  readonly fullPage?: boolean;
  readonly threshold?: number;
  readonly maxDiffPixelRatio?: number;
  readonly maxDiffPixels?: number;
}

export class VisualSnapshotConfig {
  private constructor(
    public readonly animations: "disabled" | "allow",
    public readonly caret: "hide" | "initial",
    public readonly threshold: number,
    public readonly maxDiffPixelRatio: number,
    public readonly maxDiffPixels?: number,
    public readonly fullPage?: boolean,
    public readonly mask?: Locator[],
  ) {}

  static defaults(): VisualSnapshotConfig {
    return new VisualSnapshotConfig("disabled", "hide", 0.2, 0.01, undefined, undefined, undefined);
  }

  withOverrides(overrides: VisualSnapshotOptions): VisualSnapshotConfig {
    return new VisualSnapshotConfig(
      this.animations,
      this.caret,
      overrides.threshold ?? this.threshold,
      overrides.maxDiffPixelRatio ?? this.maxDiffPixelRatio,
      overrides.maxDiffPixels ?? this.maxDiffPixels,
      overrides.fullPage ?? this.fullPage,
      overrides.mask ?? this.mask,
    );
  }

  toPlaywrightOptions() {
    return {
      animations: this.animations,
      caret: this.caret,
      threshold: this.threshold,
      maxDiffPixelRatio: this.maxDiffPixelRatio,
      maxDiffPixels: this.maxDiffPixels,
      mask: this.mask,
    };
  }
}
