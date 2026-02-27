import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TitlePage } from "../TitlePage";

describe("title feature", () => {
  it("shows app name and tagline without a native button and without page title header", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <TitlePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("donuts")).toBeInTheDocument();
    expect(screen.getByText("ドーナッツ～恋人相性チェッカー～")).toBeInTheDocument();
    expect(container.querySelector("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("navigates to people page when the title screen is clicked", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route path="/people" element={<p>people page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "タイトル画面。クリックして人物選択に進む" }));

    expect(screen.getByText("people page")).toBeInTheDocument();
  });

  it("navigates to people page when Enter or Space is pressed", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route path="/people" element={<p>people page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "タイトル画面。クリックして人物選択に進む" }), {
      key: "Enter",
    });

    expect(screen.getByText("people page")).toBeInTheDocument();
  });

  it("navigates to people page when Space is pressed", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route path="/people" element={<p>people page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "タイトル画面。クリックして人物選択に進む" }), {
      key: " ",
    });

    expect(screen.getByText("people page")).toBeInTheDocument();
  });
});
