class BankAccount:
    def __init__(self, owner: str, initial_balance: float = 0.0):
        self.owner = owner
        self._balance = initial_balance  

    def deposit(self, amount: float):
        if amount > 0:
            self._balance += amount
            print(f"Пополнение на {amount} тг. Текущий баланс: {self._balance} тг.")
        else:
            print("Сумма пополнения должна быть больше 0.")

    def withdraw(self, amount: float):
        if 0 < amount <= self._balance:
            self._balance -= amount
            print(f"Снято {amount} тг. Остаток на счете: {self._balance} тг.")
        else:
            print("Недостаточно средств или неверная сумма.")

    def get_balance(self) -> float:
        print(f"Текущий баланс: {self._balance} тг.")
        return self._balance


# Демонстрация работы
if __name__ == "__main__":
    acc = BankAccount("Олег", 10000)
    print(f"Владелец счета: {acc.owner}")
    acc.deposit(5000)
    acc.withdraw(3000)
    acc.withdraw(15000)  
    acc.get_balance()
