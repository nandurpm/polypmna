import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PolyAiMessage } from "../src/components/PolyAiMessage";

const render = (content: string) => renderToStaticMarkup(<PolyAiMessage content={content} />);

describe("POLY AI rich answers", () => {
  it("renders the bias comparison as a table with formatted formulas", () => {
    const html = render(String.raw`### BJT biasing

| Parameter | **Fixed bias** | Divider bias |
| :--- | :---: | ---: |
| Stability | $S = 1 + \beta$ | $1 + \frac{R_B}{R_E}$ |
| Voltage | **$V_{CC}$** | $V_{BE}$ |`);
    expect(html).toContain("<table");
    expect(html).toContain("<strong>Fixed bias</strong>");
    expect(html).toContain('class="katex"');
    expect(html).not.toContain("$V_{CC}$");
    expect(html.match(/<td /g)).toHaveLength(6);
  });

  it("keeps escaped pipes inside a table cell", () => {
    const html = render("| Input | Output |\n| --- | --- |\n| A \\| B | yes |");
    expect(html).toContain("A | B");
    expect(html.match(/<td /g)).toHaveLength(2);
  });

  it("supports display math and leaves incomplete streaming formulas readable", () => {
    expect(render(String.raw`$$\frac{1}{2}$$`)).toContain("katex-display");
    expect(render(String.raw`\(V_{BE}\)`)).toContain('class="katex"');
    expect(render(String.raw`$\frac{1`)).toContain("$\\frac{1");
    expect(() => render(String.raw`$\unknowncommand{a}$`)).not.toThrow();
  });

  it("does not execute model HTML, unsafe links, or math HTML commands", () => {
    const html = render(String.raw`<img src=x onerror=alert(1)> [bad](javascript:alert(1)) $\href{javascript:alert(1)}{bad}$`);
    expect(html).not.toContain("<img");
    expect(html).not.toContain('href="javascript:');
  });

  it("preserves code literally", () => {
    const html = render("```text\n$V_{CC}$ **literal**\n```");
    expect(html).toContain("}$ **");
    expect(html).toContain(">literal</span>**");
    expect(html).not.toContain("<strong>");
    expect(html).not.toContain('class="katex"');
  });
});
