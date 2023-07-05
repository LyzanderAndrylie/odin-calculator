class CalculatorState {
  constructor(calculator) {
    this._calculator = calculator;
  }

  get calculator() {
    return this._calculator;
  }

  clickClear(event) {
    this.calculator.clearState();
  }

  clickClearExpression() { }
  clickBackspace() { }
  clickOperator(event) { }
  clickNumber(event) { }
  clickPoint() { }
  clickEqual() { }
}

class InputOperatorState extends CalculatorState {
  clickClearExpression() {
    this.calculator.nextOperand = '';
    this.calculator.updateDisplay(Calculator.DEFAULT_DISPLAY_NUMBER);
    this.calculator.state = new InputNumberState(this.calculator);
  }

  clickOperator(event) {
    const operator = event.currentTarget.dataset.key;
    this.calculator.currentOperator = operator;

    const currentProgress = `${this.calculator.currentOperand} ${this.calculator.currentOperator}`;
    this.calculator.updateProgress(currentProgress);
  }

  clickNumber(event) {
    const digit = event.currentTarget.dataset.key;
    this.calculator.nextOperand = digit;
    this.calculator.updateDisplay(this.calculator.nextOperand);
    this.calculator.state = new InputNumberState(this.calculator);
  }

  clickPoint() {
    this.calculator.nextOperand = '0.';
    this.calculator.updateDisplay(this.calculator.nextOperand);
    this.calculator.state = new InputNumberState(this.calculator);
  }

  clickEqual() {
    this.calculator.nextOperand = this.calculator.currentOperand;
    this.calculator.updateDisplay(this.calculator.nextOperand);
    const inputNumberState = new InputNumberState(this.calculator);
    inputNumberState.clickEqual();
  }
}

class ResultState extends CalculatorState {
  clickClearExpression() {
    this.calculator.clearState();
  }

  clickOperator(event) {
    const nextOperand = this.calculator.calculateResult();
    this.calculator.clearState();
    this.calculator.nextOperand = nextOperand;
    this.calculator.updateDisplay(nextOperand);

    const inputNumberState = new InputNumberState(this.calculator);
    inputNumberState.clickOperator(event);
  }

  clickNumber(event) {
    this.calculator.clearState();
    const inputNumberState = new InputNumberState(this.calculator);
    this.calculator.state = inputNumberState;
    inputNumberState.clickNumber(event);
  }

  clickEqual() {
    this.calculator.currentOperand = this.calculator.calculateResult();
    this.calculator.nextOperand = Number(this.calculator.nextOperand);
    const result = this.calculator.calculateResult();
    const finalProgress = `${this.calculator.currentOperand} ${this.calculator.currentOperator} ${this.calculator.nextOperand} =`;
    this.calculator.updateProgress(finalProgress);
    this.calculator.updateDisplay(result);
  }
}

class InputNumberState extends CalculatorState {
  clickClearExpression() {
    this.calculator.nextOperand = '';
    this.calculator.updateDisplay(0);
  }

  clickBackspace() {
    this.calculator.nextOperand = this.calculator.nextOperand
      .slice(0, this.calculator.nextOperand.length - 1);
    this.calculator.updateDisplay(
      (this.calculator.nextOperand.length === 0)
        ? Calculator.DEFAULT_DISPLAY_NUMBER
        : this.calculator.nextOperand,
    );
  }

  clickOperator(event) {
    this.calculator.updateOperand(this.calculator.currentOperator);
    const operator = event.currentTarget.dataset.key;
    this.calculator.currentOperator = operator;

    const currentProgress = `${this.calculator.currentOperand} ${this.calculator.currentOperator}`;
    this.calculator.updateProgress(currentProgress);
    this.calculator.updateDisplay(this.calculator.currentOperand);
    this.calculator.state = new InputOperatorState(this.calculator);
  }

  clickNumber(event) {
    const digit = event.currentTarget.dataset.key;
    this.calculator.nextOperand += digit;
    this.calculator.updateDisplay(this.calculator.nextOperand);
  }

  clickPoint() {
    if (this.calculator.nextOperand.indexOf('.') === -1) {
      this.calculator.nextOperand += (this.calculator.nextOperand.length === 0) ? '0.' : '.';
      this.calculator.updateDisplay(this.calculator.nextOperand);
    }
  }

  clickEqual() {
    if (this.calculator.currentOperand === '') {
      const currentProgress = `${this.calculator.nextOperand} =`;
      this.calculator.updateProgress(currentProgress);
    } else {
      this.calculator.nextOperand = Number(this.calculator.nextOperand);
      const result = this.calculator.calculateResult();
      const finalProgress = `${this.calculator.currentOperand} ${this.calculator.currentOperator} ${this.calculator.nextOperand} =`;
      this.calculator.updateProgress(finalProgress);
      this.calculator.updateDisplay(result);
      this.calculator.state = new ResultState(this.calculator);
    }
  }
}

class Calculator {
  static DEFAULT_DISPLAY_NUMBER = 0;

  constructor() {
    this._state = new InputNumberState(this);
    this._currentOperand = '';
    this._currentOperator = '';
    this._nextOperand = '';
    this.addListenerToCalculatorButtons();
    this.updateDisplay(Calculator.DEFAULT_DISPLAY_NUMBER);
  }

  addListenerToCalculatorButtons() {
    this.addListenerToNumberButtons();
    this.addListenerToOperatorButton();
    this.addListenerToEqualButton();
    this.addListenerToClearButton();
    this.addListenerToClearExpressionButton();
    this.addListenerToBackspaceButton();
    this.addListenerToPointButton();
  }

  addListenerToNumberButtons() {
    const numberButtons = document.querySelectorAll('.number');
    numberButtons.forEach((button) => {
      button.addEventListener('click', this.clickNumber.bind(this));
    });
  }

  addListenerToOperatorButton() {
    const operatorButtons = document.querySelectorAll('#operator-button > button');
    operatorButtons.forEach((button) => {
      button.addEventListener('click', this.clickOperator.bind(this));
    });
  }

  addListenerToEqualButton() {
    const equalButton = document.getElementById('equal');
    equalButton?.addEventListener('click', this.clickEqual.bind(this));
  }

  addListenerToClearButton() {
    const clearButton = document.getElementById('clear');
    clearButton?.addEventListener('click', this.clickClear.bind(this));
  }

  addListenerToClearExpressionButton() {
    const clearExpressionButton = document.getElementById('ce');
    clearExpressionButton?.addEventListener('click', this.clickClearExpression.bind(this));
  }

  addListenerToBackspaceButton() {
    const backspaceButton = document.getElementById('delete');
    backspaceButton?.addEventListener('click', this.clickBackspace.bind(this));
  }

  addListenerToPointButton() {
    const pointButton = document.getElementById('dot');
    pointButton?.addEventListener('click', this.clickPoint.bind(this));
  }

  updateDisplay(str) {
    const display = document.getElementById('result');
    display.textContent = str;
  }

  updateProgress(str) {
    const progress = document.getElementById('current-progress');
    progress.textContent = str;
  }

  updateOperand(operator) {
    if (this.currentOperand === '') {
      this.currentOperand = `${Number(this.nextOperand)}`;
      this.nextOperand = '';
    } else {
      this.currentOperand = Calculator.operate(
        operator,
        Number(this.currentOperand),
        Number(this.nextOperand),
      );
      this.nextOperand = '';
    }
  }

  clearState() {
    this.state = new InputNumberState(this);
    this.currentOperand = '';
    this.currentOperator = '';
    this.nextOperand = '';
    this.updateDisplay(0);
    this.updateProgress('');
  }

  set state(state) {
    this._state = state;
  }

  get state() {
    return this._state;
  }

  set currentOperand(operand) {
    this._currentOperand = operand;
  }

  get currentOperand() {
    return this._currentOperand;
  }

  set currentOperator(operator) {
    this._currentOperator = operator;
  }

  get currentOperator() {
    return this._currentOperator;
  }

  set nextOperand(operand) {
    this._nextOperand = operand;
  }

  get nextOperand() {
    return this._nextOperand;
  }

  calculateResult() {
    const result = Calculator.operate(
      this.currentOperator,
      Number(this.currentOperand),
      Number(this.nextOperand),
    );
    return (Number.isNaN(result) || result % 1 === 0)
      ? result
      : result.toFixed(2);
  }

  static operate(operator, num1, num2) {
    switch (operator) {
      case '+':
        return Calculator.add(num1, num2);
      case '-':
        return Calculator.substract(num1, num2);
      case '*':
        return Calculator.multiply(num1, num2);
      case '/':
        return Calculator.divide(num1, num2);
      default:
        return NaN;
    }
  }

  static add(num1, num2) {
    return num1 + num2;
  }

  static substract(num1, num2) {
    return num1 - num2;
  }

  static multiply(num1, num2) {
    return num1 * num2;
  }

  static divide(num1, num2) {
    if (num2 === 0) {
      return NaN;
    }
    return num1 / num2;
  }

  clickClear(event) {
    this.state.clickClear(event);
  }

  clickClearExpression() {
    this.state.clickClearExpression();
  }

  clickBackspace() {
    this.state.clickBackspace();
  }

  clickOperator(event) {
    this.state.clickOperator(event);
  }

  clickNumber(event) {
    this.state.clickNumber(event);
  }

  clickPoint() {
    this.state.clickPoint();
  }

  clickEqual() {
    this.state.clickEqual();
  }
}

const calculator = new Calculator();
