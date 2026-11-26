class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        self.pedido_id = pedido_id
        super().__init__(f"Pedido {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        self.producto_id = producto_id
        super().__init__(f"Producto {producto_id} no encontrado")


class ProductoNoDisponible(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"El producto {producto_id} no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"Stock insuficiente para el producto {producto_id}")


class ProductoRepetido(Exception):
    def __init__(self):
        super().__init__("Un producto no puede repetirse en el mismo pedido")


class PedidoAjeno(Exception):
    def __init__(self):
        super().__init__("El pedido pertenece a otro usuario")


class TransicionInvalida(Exception):
    def __init__(self, estado_actual: str, estado_solicitado: str):
        super().__init__(
            f"No se puede cambiar el pedido de {estado_actual} a {estado_solicitado}"
        )