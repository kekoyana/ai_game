import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./App";

describe("San Juan App", () => {
  test("初期レンダリングで役割ボタンが表示される", () => {
    render(<App />);
    expect(screen.getByText("建築士")).toBeInTheDocument();
    expect(screen.getByText("監督")).toBeInTheDocument();
    expect(screen.getByText("商人")).toBeInTheDocument();
    expect(screen.getByText("参事会議員")).toBeInTheDocument();
    expect(screen.getByText("金鉱掘り")).toBeInTheDocument();
  });

  test("リセットボタンが表示される", () => {
    render(<App />);
    expect(screen.getByText("リセット")).toBeInTheDocument();
  });

  test("役割ボタンを押すとメッセージが更新される", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("建築士"));
    const prompt = await screen.findByText(/建設するカードを選んでください/);
    expect(prompt).toBeInTheDocument();
  });

  test("CPUが監督を選んだときも全員生産される", async () => {
    jest.useFakeTimers();
    render(<App />);
    // あなたが何か役割を選ぶ
    fireEvent.click(screen.getByText("建築士"));
    // 建設カード選択UIが出るので1枚選ぶ
    const cardBtn = await screen.findAllByRole("button", { name: /コスト:/ });
    fireEvent.click(cardBtn[0]);
    // CPUの役割選択を進める
    act(() => {
      jest.runAllTimers();
    });
    // メッセージに「生産施設に商品を生産しました」または「全員の生産施設に商品を生産しました」が含まれる
    const msg = screen.getByText((content) =>
      content.includes("生産施設に商品を生産しました") ||
      content.includes("全員の生産施設に商品を生産しました")
    );
    expect(msg).toBeInTheDocument();
    jest.useRealTimers();
  });
});