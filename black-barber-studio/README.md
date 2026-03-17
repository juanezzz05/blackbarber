# ✂️ Black Barber Studio — App de Agendamiento

App web para agendar citas en tu barbería. Diseñada para un solo barbero con 4-6 citas por día.

## 🚀 GUÍA PASO A PASO PARA PUBLICAR

### Paso 1: Crear cuenta en GitHub (si no tienes)
1. Ve a [github.com](https://github.com) y crea una cuenta gratuita
2. Confirma tu correo

### Paso 2: Crear un repositorio
1. En GitHub, haz clic en el botón verde **"New"** (o ve a github.com/new)
2. Nombre: `black-barber-studio`
3. Déjalo como **Public**
4. NO marques "Add a README" (ya lo tienes)
5. Clic en **Create repository**

### Paso 3: Subir el código
Si tienes Git instalado en tu computador:
```bash
cd black-barber-studio
git init
git add .
git commit -m "Mi barbería online"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/black-barber-studio.git
git push -u origin main
```

Si NO tienes Git, puedes subir los archivos directamente:
1. En tu repositorio de GitHub, haz clic en **"uploading an existing file"**
2. Arrastra TODOS los archivos y carpetas del proyecto
3. Haz clic en **Commit changes**

### Paso 4: Desplegar en Vercel (GRATIS)
1. Ve a [vercel.com](https://vercel.com) y haz clic en **"Sign Up"**
2. Escoge **"Continue with GitHub"**
3. Autoriza Vercel para acceder a tu GitHub
4. Haz clic en **"New Project"**
5. Busca tu repositorio `black-barber-studio` y haz clic en **"Import"**
6. En la configuración:
   - **Framework Preset**: Create React App (se detecta automáticamente)
   - Deja todo lo demás por defecto
7. Haz clic en **"Deploy"**
8. ¡Espera 1-2 minutos y tu app estará online!

### Paso 5: Tu link
Vercel te dará un link como: `https://black-barber-studio.vercel.app`

Este es el link que compartes por WhatsApp a tus clientes.

Si quieres un dominio personalizado (ej: `blackbarberstudio.com`), puedes comprarlo en Vercel o en servicios como Namecheap (~$10 USD/año).

---

## ⚡ PERSONALIZACIÓN RÁPIDA

Edita el archivo `src/App.js` y busca la sección marcada con:
```
// ⚡ EDITA AQUÍ LOS DATOS DE TU BARBERÍA
```

Ahí puedes cambiar:
- Tu número de WhatsApp (formato: `https://wa.me/573XXXXXXXXX`)
- Tu link de Instagram
- Tu link de TikTok
- La dirección y link de Google Maps

### Cambiar servicios o precios
Busca el array `ALL_SERVICES` al inicio del archivo y modifica nombres, precios o duración.

---

## 🔒 Panel Admin
- PIN por defecto: **1234**
- Cámbialo inmediatamente desde Panel Admin → Config
- Configura correo y teléfono de recuperación

## 📱 Funcionalidades
- ✅ Agendamiento de citas online
- ✅ 11 servicios + 1 promoción
- ✅ Calendario con bloqueo de días
- ✅ Horarios personalizables por día
- ✅ Sistema de calificaciones
- ✅ Links a redes sociales y Maps
- ✅ Panel admin con PIN
- ✅ Recuperación de PIN por correo/teléfono
- ✅ Diseño responsive (celular y PC)
