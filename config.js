//Cogemos la variable de entorno para utilizar 
// el puerto 3000
//const PORT=process.env.PORT ?? 3000
//PRODUCCION 10 DEVELOPMENT=5
//SECRET_JWT_KEY en produccion se injecta com a variable d'entorn
//Tindrà la protecció del servidor.
export const {
    PORT=3000,
    SALT_ROUNDS=10 ,
    SECRET_JWT_KEY="aixo-es-una-super-paraula-secreta" 
}=process.env