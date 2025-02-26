
import { Page, Download, expect } from '@playwright/test';
import dayjs from 'dayjs';

import fs from 'fs/promises';
import path from 'path';

//For Use with MUI
const selectors = {
  DROPDOWN_OPEN_BUTTON: "button[aria-label='Open']",
  SELECT_OPEN_BUTTON: "div[aria-expanded='true']",
  DROPDOWN_INPUT: "input[role='combobox']",
  getOptionSelector: (label) => `li[data-label='${label}']`,
  getOptionValueSelector: (label) => `li[data-value='${label}']`,
  getRadioOptionSelector: (label) => `label[data-label='${label}']`,
};

type Point = [number, number];

export class BrowserActor {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  wait(timeInMs: number) {
    return new Promise((resolve) => setTimeout(resolve, timeInMs));
  }
  pause() {
    return this.page.pause();
  }

  amUsingBrowser(page: Page) {
    this.page = page;
  }

  refreshThePage() {
    return this.page.reload();
  }

  navigateTo(url: string) {
    return this.page.goto(url);
  }

  click(element: string) {
    return this.page.click(element);
  }

  async cantClick(element: string) {
    const isDisabled = await this.page.isDisabled(element);
    return isDisabled;
  }
  async canClick(element: string) {
    return !(await this.cantClick(element));
  }

  enterInput(element: string, value: string) {
    return this.page.locator(element).fill(value);
  }

  expectToSee(selector: string) {
    return expect(this.page.locator(selector)).toBeVisible();
  }

  async getTextFromElements(selector: string) {
    const elements = this.page.locator(selector);
    return elements.allTextContents();
  }

  async expectToSeeNumberOfElements(selector: string, count: number) {
    await this.waitFor(async () => {
      const elements = this.page.locator(selector);
      expect(await elements.count()).toEqual(count);
    });
  }

  async expectToSeeNumberOfElementsToBeGreaterThan(selector: string, count: number) {
    await this.waitFor(async () => {
      const elements = this.page.locator(selector);
      expect(await elements.count()).toBeGreaterThan(count);
    });
  }

  dontSee(selector: string) {
    return expect(this.page.locator(selector)).not.toBeVisible();
  }

  async expectCheckboxSelection(selector: string, isSelected: boolean = true) {
    const checkedValue = await this.page.isChecked(selector);
    expect(checkedValue).toEqual(isSelected);
  }

  async expectTextToContain(selector: string, text: string) {
    expect(await this.page.textContent(selector)).toContain(text);
  }

  async waitForNewTab() {
    return this.page.context().waitForEvent('page');
  }

  waitFor(condition: Function, timeout: number = 10000) {
    let start = new Date().getTime();
    return new Promise((resolve, reject) => {
      const runFunction = async () => {
        try {
          const result = await condition();
          if (result === false) {
            throw new Error('Condition not met');
          }
          resolve(null);
        } catch (err) {
          const time = new Date().getTime();
          if (time - start < timeout) {
            setTimeout(runFunction, 20);
          } else {
            reject(err);
          }
        }
      };
      runFunction();
    });
  }

  async getTextContent(selector: string) {
    return await this.page.textContent(selector);
  }

  async expectTextToBe(selector: string, text: string) {
    await this.waitFor(async () => {
      const elText = await this.getTextContent(selector);
      expect(elText).toEqual(text);
    });
  }
  async openDropdown(selector: string) {
    await this.page.click(selector + ' ' + selectors.DROPDOWN_OPEN_BUTTON);
  }
  async openSelect(selector: string) {
    await this.page.click(selector);
  }
  async chooseDropdownOption(selector: string, label: string) {
    await this.openDropdown(selector);
    await this.page.click(selectors.getOptionSelector(label));
  }
  async chooseSelectOption(selector: string, label: string) {
    await this.openSelect(selector);
    await this.page.click(selectors.getOptionSelector(label));
  }
  async chooseSelectOptionValue(selector: string, value: string) {
    await this.openSelect(selector);
    await this.page.click(selectors.getOptionValueSelector(value));
  }

  async chooseRadioOption(selector: string, label: string) {
    await this.openSelect(selector);
    await this.page.click(selectors.getRadioOptionSelector(label));
  }

  async expectDropdownToHaveValue(selector: string, value: string) {
    const inputVal = await this.page.inputValue(selector + ' ' + selectors.DROPDOWN_INPUT);
    expect(inputVal).toEqual(value);
  }
  async uploadFile(selector: string, file: string) {
    await this.page.setInputFiles(selector + " [data-role='file-upload']", file);
  }

  expectToSeeUrl(url: string, options?) {
    return this.page.waitForURL(url, options);
  }
  expectToBeDisabled(sel: string) {
    return this.expectToSee(sel.trimEnd() + '[disabled]');
  }

  expectToBeEnabled(sel: string) {
    return this.expectToSee(sel.trimEnd() + ':not([disabled])');
  }
  expectPageToMatchSnapshot() {
    return expect(this.page).toHaveScreenshot();
  }

  async getAttributeFromElement(selector: string, attribute: string) {
    await this.expectToSee(selector);
    const el = await this.page.$(selector);
    return await el?.getAttribute(attribute);
  }

  closePage() {
    return this.page.close();
  }
  goBack() {
    return this.page.goBack();
  }
  async getInputValue(selector: string) {
    const el = await this.page.$(selector);
    const val = await el?.inputValue();
    return val;
  }
  async expectInputValueToBe(selector: string, value: string) {
    const val = await this.getInputValue(selector);
    expect(val).toEqual(value);
  }

  async dragDocumentUpload(target: string, filePath: string) {
    const buffer = await fs.readFile(filePath);
    const filename = path.basename(filePath);
    const fileInfo = {
      filename,
      data: buffer,
      hexData: buffer.toString('hex'),
    };

    const dataTransfer = await this.page.evaluateHandle(
      async ({ bufferData, filename }) => {
        //this function runs in the browser. you will not be able to set breakpoints
        const dt = new DataTransfer();
        const blobData = await fetch(bufferData).then((res) => res.blob());
        const file = new File([blobData], filename, {
          type: 'application/pdf',
        });
        dt.items.add(file);
        return dt;
      },
      {
        bufferData: `data:application/octet-stream;base64,${buffer.toString('base64')}`,
        filename,
      }
    );

    await this.page.dispatchEvent(target, 'drop', { dataTransfer });
  }
  setupFileDownloader(): Promise<Download> {
    return this.page.waitForEvent('download');
  }
  async getDownloadedFilePath(download: Download): Promise<string | null> {
    const downloadPath = `test-downloads/${download.suggestedFilename()}`;
    await download.saveAs(downloadPath);
    return downloadPath;
  }

  async expectFilesToMatch(path1: string | null | Buffer, path2: string | Buffer | null) {
    const readBuffer = async (item: string | null | Buffer): Promise<Buffer> => {
      if (!item) {
        throw new Error('Path is null');
      } else if (typeof item === 'string') {
        return await fs.readFile(item);
      }
      return item;
    };
    const buffer = await readBuffer(path1);

    const buffer2 = await readBuffer(path2);
    return expect(buffer.equals(buffer2)).toEqual(true);
  }

  async getBoundingBox(selector: string) {
    return await this.page.locator(selector).boundingBox();
  }
  async dragAndDrop(source: string, target: string) {
    return this.page.dragAndDrop(source, target);
  }
  async dragElement(selector: string, drag: Point) {
    const bbox = await this.getBoundingBox(selector);

    await this.performDrag([bbox!.x + bbox!.width / 2, bbox!.y + bbox!.height / 2], drag);
  }

  async performDrag(start: Point, distance: Point) {
    await this.page.mouse.move(start[0], start[1]);
    await this.page.mouse.down();
    await this.page.mouse.move(start[0] + distance[0], start[1] + distance[1]);

    await this.page.mouse.up();
  }
  async clickCheckbox(selector: string) {
    await this.click(`${selector} [data-role='checkbox']`);
  }
  async selectCheckboxValue(selector: string, shouldBeChecked: boolean) {
    const element = await this.page.locator(`${selector} [data-role='checkbox']`);
    const isChecked = (await element.getAttribute('data-checked')) === 'true';
    const needsToggle = isChecked !== shouldBeChecked;
    if (needsToggle) {
      await element.click();
    }
  }
  async selectCheckValues(selector: string, values: string[]) {
    const checkElements = await this.page.locator(`${selector} [data-role='checkbox']`).all();
    for (const chk of checkElements) {
      const isChecked = (await chk.getAttribute('data-checked')) === 'true';
      const checkValue = (await chk.getAttribute('data-value')) + '';
      const shouldBeChecked = values.includes(checkValue);
      const needsToggle = isChecked !== shouldBeChecked;
      if (needsToggle) {
        await chk.click();
      }
    }
  }
  async expectToSeeIndicator(selector: string, ok: boolean) {
    await this.expectToSee(`${selector} [data-indicator="${ok ? 'ok' : 'not-ok'}"]`);
  }

  finishMyTask() {}
}
