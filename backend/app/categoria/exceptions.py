class CategoriaNoEncontrada(Exception):
    def __init__(self):
        super().__init__("Categoría no encontrada")


class CategoriaDuplicada(Exception):
    def __init__(self):
        super().__init__("Ya existe una categoría con ese nombre")


class NombreCategoriaNulo(Exception):
    def __init__(self):
        super().__init__("El nombre no puede ser nulo")
