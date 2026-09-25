import { Locator, Page } from "@playwright/test";
import { BaseEntity } from "../base.entity";

export abstract class BaseComponent extends BaseEntity {
  readonly root?: Locator;

  protected constructor(page: Page, root?: string | Locator) {
    super(page);

    if (!root) return;

    this.root = typeof root === "string" ? page.locator(root) : root;
  }

  protected within(selector: string): Locator {
    return this.root?.locator(selector) ?? this.page.locator(selector);
  }
}
