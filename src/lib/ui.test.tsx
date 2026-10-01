import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { Accordion, Pagination } from "@/components/ui";
import { countdown, formatBytes, localDateKey } from "@/lib/format";
import { I18nProvider, useI18n } from "@/lib/i18n";

describe("format helpers", () => {
  it("builds local YYYY-MM-DD keys without UTC shifting", () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(localDateKey(new Date(2026, 0, 5, 0, 1))).toBe("2026-01-05");
  });

  it("formats countdowns and file sizes", () => {
    const inTwoDays = new Date(Date.now() + 2 * 86_400_000 + 3 * 3_600_000 + 60_000).toISOString();
    expect(countdown(inTwoDays)).toBe("in 2 days, 3 hr");
    expect(countdown(new Date(Date.now() - 1000).toISOString())).toBe("now");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(null)).toBe("");
  });
});

function Greeting() {
  const { t, setLanguage } = useI18n();
  return (
    <div>
      <p>{t("nav.home")}</p>
      <button onClick={() => setLanguage("hi")}>hi</button>
    </div>
  );
}

describe("i18n", () => {
  it("switches language and falls back to English for missing keys", () => {
    render(
      <I18nProvider>
        <Greeting />
      </I18nProvider>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    fireEvent.click(screen.getByText("hi"));
    expect(screen.getByText("होम")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("hi");
  });
});

describe("Pagination", () => {
  it("shows the range and moves between pages", () => {
    const onChange = vi.fn();
    render(<Pagination page={2} pageSize={20} count={45} onChange={onChange} />);
    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(onChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<Pagination page={1} pageSize={20} count={0} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Accordion", () => {
  it("opens one answer at a time", () => {
    render(
      <Accordion
        items={[
          { question: "Q1", answer: "A1" },
          { question: "Q2", answer: "A2" },
        ]}
      />
    );
    expect(screen.getByText("A1")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Q2"));
    expect(screen.getByText("A2")).toBeInTheDocument();
    expect(screen.queryByText("A1")).not.toBeInTheDocument();
  });
});
