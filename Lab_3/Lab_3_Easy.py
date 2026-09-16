class Student:
    def __init__(self, name: str, age: int, specialty: str):
        self.name = name
        self.age = age
        self.specialty = specialty

    def display_info(self):
        print(f"Студент: {self.name} | Возраст: {self.age} | Специальность: {self.specialty}")

    def change_specialty(self, new_specialty: str):
        print(f"Специальность изменена с '{self.specialty}' на '{new_specialty}'")
        self.specialty = new_specialty


# Демонстрация работы
if __name__ == "__main__":
    student1 = Student("Константин", 20, "Информационные системы")
    student1.display_info()
    student1.change_specialty("Программное обеспечение")
    student1.display_info()
