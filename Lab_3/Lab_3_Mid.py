class BankAccount:
    def __init__(self, owner: str, password: str, initial_balance: float = 0.0):
        self.owner = owner
        self.password = password
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
        return self._balance


class BankSystem:
    def __init__(self):
        self.accounts = {}

    def register(self):
        username = input("Придумайте логин: ").strip()
        if username in self.accounts:
            print("Ошибка: Пользователь с таким логином уже существует.")
            return

        password = input("Придумайте пароль: ").strip()
        try:
            initial = float(input("Введите начальный баланс (или 0): ") or 0)
        except ValueError:
            print("Некорректная сумма. Установлен баланс 0 тг.")
            initial = 0.0

        self.accounts[username] = BankAccount(username, password, initial)
        print(f"Пользователь '{username}' успешно зарегистрирован!")

    def login(self) -> BankAccount | None:
        username = input("Введите логин: ").strip()
        password = input("Введите пароль: ").strip()

        acc = self.accounts.get(username)
        if acc and acc.password == password:
            print(f"\nУспешный вход! С возвращением, {username}.")
            return acc
        
        print("Неверный логин или пароль.")
        return None


def user_session(acc: BankAccount):
    
    while True:
        oper = input('\nВыберите операцию (+, -, check, logout): ').strip()
        
        if oper == '+':
            try:
                dep = float(input('Введите сумму пополнения: '))
                acc.deposit(dep)
            except ValueError:
                print("Введите числовое значение.")
        elif oper == '-': 
            try:
                wit = float(input('Введите сумму снятия: '))
                acc.withdraw(wit)
            except ValueError:
                print("Введите числовое значение.")
        elif oper == 'check':  
            print(f"Текущий баланс: {acc.get_balance()} тг.")
        elif oper == 'logout':
            print("Вы вышли из личного аккаунта.")
            break
        else:
            print("Неверная операция.")


if __name__ == "__main__":
    bank = BankSystem()

    while True:
        print("\n--- ГЛАВНОЕ МЕНЮ ---")
        print("1. Зарегистрироваться")
        print("2. Войти")
        print("3. Выход из программы")
        
        choice = input("Выберите действие (1-3): ").strip()

        if choice == '1':
            bank.register()
        elif choice == '2':
            user_account = bank.login()
            if user_account:
                user_session(user_account)
        elif choice == '3':
            print("Работа завершена. До свидания!")
            break
        else:
            print("Неверный пункт меню.")
