class ProductoNoEncontrado(Exception):
    def __init__(self):
        super().__init__("Producto no encontrado")


class CategoriaNoEncontrada(Exception):
    def __init__(self):
        super().__init__("Categoría no encontrada")


class CampoProductoNulo(Exception):
    def __init__(self, campo: str):
        super().__init__(f"El campo {campo} no puede ser nulo")
