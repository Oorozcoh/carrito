# managers/

Esta carpeta se mantiene por consistencia con la arquitectura de
referencia del curso, pero en este proyecto **no tiene contenido
activo**: los antiguos `CartManager`/`ProductManager` (persistencia en
archivos `.json`, previos a MongoDB) fueron reemplazados por la capa
`dao/` + `repositories/`, que cumple el mismo rol de forma más
profesional (persistencia real en base de datos, separada de la
lógica de negocio).

Si en el futuro se necesita un "manager" que no encaje como DAO ni
como Repository (por ejemplo, orquestar varios repositories para un
proceso de negocio muy específico), este es el lugar.
