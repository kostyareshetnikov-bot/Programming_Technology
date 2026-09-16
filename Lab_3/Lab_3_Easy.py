class Student:
    def __init__(self, name: str, age: int, specialty: str):
        self.name = name
        self.age = age
        self.specialty = specialty

    def display_info(self):
        print(f"Студент: {self.name} | Возраст: {self.age} | Специальность: {self.specialty}")

    def change_specialty(self, new_specialty: str):
        print(f"Специальность студента {self.name} изменена с '{self.specialty}' на '{new_specialty}'")
        self.specialty = new_specialty


def main():
    students: list[Student] = []

    while True:
        print("\n=== МЕНЮ УПРАВЛЕНИЯ ===")
        print("1. Добавить студента")
        print("2. Показать всех студентов")
        print("3. Изменить специальность")
        print("0. Выход")

        choice = input("\nВыберите действие (0-3): ").strip()

        if choice == "1":
        
            name = input("Введите имя студента: ").strip()
            
            while True:
                try:
                    age = int(input("Введите возраст: "))
                    if age <= 0:
                        print("Возраст должен быть положительным числом.")
                        continue
                    break
                except ValueError:
                    print("Ошибка: введите возраст целым числом!")

            specialty = input("Введите специальность: ").strip()

            new_student = Student(name, age, specialty)
            students.append(new_student)
            print(f"Студент {name} успешно добавлен!")

        elif choice == "2":
           
            if not students:
                print("\nСписок студентов пока пуст.")
            else:
                print(f"\n--- Список студентов ({len(students)}) ---")
                for i, student in enumerate(students, 1):
                    print(f"{i}. ", end="")
                    student.display_info()

        elif choice == "3":
       
            if not students:
                print("\nСписок пуст, изменять некому.")
                continue

            print("\nВыберите студента для смены специальности:")
            for i, student in enumerate(students, 1):
                print(f"{i}. {student.name} (текущая: {student.specialty})")

            try:
                index = int(input("\nВведите номер студента из списка: ")) - 1
                if 0 <= index < len(students):
                    new_spec = input("Введите новую специальность: ").strip()
                    students[index].change_specialty(new_spec)
                else:
                    print("Ошибка: студента с таким номером нет в списке.")
            except ValueError:
                print("Ошибка: введите корректный номер!")

        elif choice == "0":
            print("Работа программы завершена.")
            break

        else:
            print("Неверный ввод. Выберите пункт из меню (0, 1, 2 или 3).")


if __name__ == "__main__":
    main()
