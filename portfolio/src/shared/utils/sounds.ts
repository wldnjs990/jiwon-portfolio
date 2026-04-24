// 프린터 뚜껑 열기
export const openPrinterLidAudio =
  new Audio("/sounds/open_printer_lid.mp3") || null;

// 프린터 뚜껑 닫기
export const closePrinterLidAudio =
  new Audio("/sounds/close_printer_lid.mp3") || null;

// 라벨지 절단
export const cutLabelAudio = new Audio("/sounds/cut_label.mp3") || null;

// 라벨지 인쇄
export const printLabelAudio = new Audio("/sounds/print_label.mp3") || null;
