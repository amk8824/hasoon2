import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputDot = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const result = calculate(currentValue, inputValue, operation);

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      {/* Display */}
      <div className="bg-slate-100 p-4 rounded-lg mb-4 text-right">
        <div className="text-2xl font-bold text-slate-800 min-h-8 break-all">
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <Button variant="outline" onClick={clear} className="col-span-2 h-12">
          مسح
        </Button>
        <Button variant="outline" onClick={() => performOperation("÷")} className="h-12 bg-orange-100 hover:bg-orange-200">
          ÷
        </Button>
        <Button variant="outline" onClick={() => performOperation("×")} className="h-12 bg-orange-100 hover:bg-orange-200">
          ×
        </Button>

        {/* Row 2 */}
        <Button variant="outline" onClick={() => inputNumber("7")} className="h-12">
          7
        </Button>
        <Button variant="outline" onClick={() => inputNumber("8")} className="h-12">
          8
        </Button>
        <Button variant="outline" onClick={() => inputNumber("9")} className="h-12">
          9
        </Button>
        <Button variant="outline" onClick={() => performOperation("-")} className="h-12 bg-orange-100 hover:bg-orange-200">
          -
        </Button>

        {/* Row 3 */}
        <Button variant="outline" onClick={() => inputNumber("4")} className="h-12">
          4
        </Button>
        <Button variant="outline" onClick={() => inputNumber("5")} className="h-12">
          5
        </Button>
        <Button variant="outline" onClick={() => inputNumber("6")} className="h-12">
          6
        </Button>
        <Button variant="outline" onClick={() => performOperation("+")} className="h-12 bg-orange-100 hover:bg-orange-200">
          +
        </Button>

        {/* Row 4 */}
        <Button variant="outline" onClick={() => inputNumber("1")} className="h-12">
          1
        </Button>
        <Button variant="outline" onClick={() => inputNumber("2")} className="h-12">
          2
        </Button>
        <Button variant="outline" onClick={() => inputNumber("3")} className="h-12">
          3
        </Button>
        <Button variant="outline" onClick={handleEquals} className="h-12 row-span-2 bg-blue-500 hover:bg-blue-600 text-white">
          =
        </Button>

        {/* Row 5 */}
        <Button variant="outline" onClick={() => inputNumber("0")} className="h-12 col-span-2">
          0
        </Button>
        <Button variant="outline" onClick={inputDot} className="h-12">
          .
        </Button>
      </div>
    </div>
  );
}