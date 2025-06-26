/* global fabric */
import React, { useRef, useState, useEffect, useCallback } from 'react';

export default function EditorCamiseta() {
  /* ───────── refs ───────── */
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const tshirtRef = useRef(null);

  const textRef = useRef(null);
  const colorRef = useRef(null);
  const fontRef = useRef(null);
  const sizeRef = useRef(null);
  const fileRef = useRef(null);

  /* ───────── historial (para Deshacer/Rehacer) ───────── */
  const history = useRef([]);
  const step = useRef(-1);
  const MAX_STEPS = 20;

  const saveState = useCallback(() => {
    if (!fabricRef.current) return;
    const json = fabricRef.current.toJSON();
    history.current = history.current.slice(0, step.current + 1);
    history.current.push(json);
    if (history.current.length > MAX_STEPS) history.current.shift();
    step.current = history.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (step.current <= 0) return;
    step.current -= 1;
    fabricRef.current.loadFromJSON(history.current[step.current], () => {
      fabricRef.current.requestRenderAll();
    });
  }, []);

  const deleteSelected = useCallback(() => {
    const c = fabricRef.current;
    if (!c) return;
    const obj = c.getActiveObject();

    if (obj) {
      if (obj.type === 'activeSelection') {
        obj.forEachObject((o) => c.remove(o));
      } else {
        c.remove(obj);
      }
      c.discardActiveObject();
      c.requestRenderAll();
      saveState();
    }
  }, [saveState]);

  /* ───────── state (para tipo, género, talla, vista) ───────── */
  const [tipo, setTipo] = useState('basica');
  const [genero, setGenero] = useState('hombre');
  const [talla, setTalla] = useState('M');
  const [vista, setVista] = useState('front');

  /* ───────── helpers ───────── */
  const tshirtSrc = useCallback(
    () => `/img/camiseta_${tipo}_${genero}_${vista}.png`,
    [tipo, genero, vista]
  );

  const loadFabricImage = useCallback((url) => {
    if (window.fabric.Image.fromURL.length >= 3) {
      return new Promise((res, rej) =>
        window.fabric.Image.fromURL(
          url,
          (img) => (img ? res(img) : rej(new Error('no image'))),
          { crossOrigin: 'anonymous' }
        )
      );
    }
    return window.fabric.Image.fromURL(url, { crossOrigin: 'anonymous' });
  }, []);

  /* ───────── init canvas ───────── */
  useEffect(() => {
    let checkFabricInterval;

    const initializeCanvas = () => {
      if (typeof window.fabric === 'undefined' || !canvasRef.current) {
        return;
      }

      if (fabricRef.current) {
        clearInterval(checkFabricInterval);
        return;
      }

      const c = new window.fabric.Canvas(canvasRef.current, {
        preserveObjectStacking: true,
        selection: true,
      });

      const box = canvasRef.current.parentElement;
      if (box) {
        c.setWidth(box.clientWidth);
        c.setHeight(box.clientHeight);
      }
      fabricRef.current = c;
      saveState();

      const keyHandler = (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          deleteSelected();
        }
      };
      window.addEventListener('keydown', keyHandler);

      clearInterval(checkFabricInterval);
    };

    checkFabricInterval = setInterval(initializeCanvas, 100);

    return () => {
      clearInterval(checkFabricInterval);
      window.removeEventListener('keydown', keyHandler);
      try { if (fabricRef.current) fabricRef.current.dispose(); } catch (e) { /* already disposed */ }
      fabricRef.current = null; // Limpiar la ref explícitamente
    };
  }, [saveState, deleteSelected]);

  /* ───────── cambia camiseta/vista ───────── */
  useEffect(() => {
    if (!fabricRef.current || !tshirtRef.current) return;

    tshirtRef.current.src = tshirtSrc();
    fabricRef.current.clear();
    fabricRef.current.requestRenderAll();
    saveState();
  }, [tshirtSrc, saveState]);

  /* ───────── subir imagen ───────── */
  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;

    const r = new FileReader();
    r.onload = async (ev) => {
      try {
        const img = await loadFabricImage(ev.target.result);
        const c = fabricRef.current;

        img.scaleToWidth(c.getWidth() * 0.5);
        if (img.getScaledHeight() > c.getHeight()) {
          img.scaleToHeight(c.getHeight() * 0.5);
        }
        c.viewportCenterObject(img);
        c.add(img);
        c.requestRenderAll();
        saveState();
      } catch (err) {
        console.error('No se pudo cargar la imagen:', err);
        alert('Imagen no válida o dañada.');
      }
    };
    r.readAsDataURL(file);
    e.target.value = '';
  };

  /* ───────── añadir texto ───────── */
  const addText = () => {
    if (!fabricRef.current) return;
    const value = textRef.current.value.trim();
    if (!value) return;

    const box = new window.fabric.IText(value, {
      fill: colorRef.current.value,
      fontFamily: fontRef.current.value,
      fontSize: parseInt(sizeRef.current.value, 10) || 24,
      editable: true,
    });

    const c = fabricRef.current;
    c.add(box);
    c.viewportCenterObject(box);
    c.setActiveObject(box);
    c.requestRenderAll();
    textRef.current.value = '';
    saveState();
  };

  /* ───────── añadir al carrito (NUEVA FUNCIONALIDAD) ───────── */
  const addToCart = async () => {
    if (!fabricRef.current) {
      alert('El editor no está listo. Intenta recargar la página.');
      return;
    }

    // 1. Obtener los datos del diseño actual del lienzo
    const canvasJson = fabricRef.current.toJSON(); // Esto incluye todos los objetos (imágenes, texto) y sus propiedades
    const designElements = { images: [], texts: [] };

    // Aquí Fabric.js no serializa correctamente el Data URL completo para imágenes
    // Necesitas almacenar la Data URL original si quieres regenerar la imagen
    // o si Fabric.js ya la incluye en el JSON, lo cual depende de la versión y cómo se añadió.
    // Para simplificar, enviaremos el JSON completo del canvas y algunos metadatos.

    // Si necesitas los objetos individuales (para procesamiento backend más fácil)
    canvasJson.objects.forEach(obj => {
      if (obj.type === 'image') {
        designElements.images.push({
          dataUrl: obj.src, // Fabric.js a veces incluye el src original (Data URL)
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
          // Añade otras propiedades que necesites
        });
      } else if (obj.type === 'i-text') {
        designElements.texts.push({
          text: obj.text,
          fontFamily: obj.fontFamily,
          fontSize: obj.fontSize,
          fill: obj.fill,
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
        });
      }
    });


    // 2. Crear el objeto DTO para enviar al backend
    const designData = {
      type: tipo,
      gender: genero,
      size: talla,
      view: vista,
      // Envía el JSON completo del canvas (más robusto para la impresión si el backend lo parsea)
      fabricCanvasJson: JSON.stringify(canvasJson),
      // Opcional: si quieres enviar los elementos desglosados (menos robusto si Fabric.js lo puede reconstruir mejor)
      // designElements: designElements,
    };

    console.log('Enviando diseño al backend:', designData);

    // 3. Obtener la URL del backend desde las variables de entorno de Astro/Vite
    // Astro expone las variables de entorno que empiezan con PUBLIC_
    const backendUrl = import.meta.env.PUBLIC_BACKEND_URL; // Asegúrate de que esta variable esté configurada en Render

    if (!backendUrl) {
      alert('URL del backend no configurada. Contacta al administrador.');
      console.error('PUBLIC_BACKEND_URL no está definida en el frontend.');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/designs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      alert(`¡Diseño guardado con éxito! ID de pedido: ${result.id}`);
      console.log('Respuesta del backend:', result);

      // Opcional: Redirigir al usuario a una página de confirmación o de carrito
    } catch (error) {
      console.error('Error al enviar el diseño al backend:', error);
      alert('Hubo un problema al guardar tu diseño. Intenta de nuevo más tarde.');
    }
  };

  /* ───────── estilos botón vista ───────── */
  const btnVista = (side) =>
    `font-bold py-2 px-4 rounded text-white ${side === vista
      ? 'bg-blue-500 hover:bg-blue-700'
      : 'bg-gray-400 hover:bg-gray-600'
    }`;

  /* ───────── UI ───────── */
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* panel */}
      <aside className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md space-y-6">
        {/* tipo / género / talla */}
        <div>
          <label className="block mb-1 font-semibold">Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="w-full border rounded px-3 py-2">
            <option value="basica">Básica</option>
            <option value="deportiva">Deportiva</option>
            <option value="sudadera">Sudadera</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Género</label>
          <select value={genero} onChange={(e) => setGenero(e.target.value)}
            className="w-full border rounded px-3 py-2">
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Talla</label>
          <select value={talla} onChange={(e) => setTalla(e.target.value)}
            className="w-full border rounded px-3 py-2">
            {['S', 'M', 'L', 'XL', 'XXL'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* imagen */}
        <div>
          <h3 className="font-semibold mb-2">Añadir imagen</h3>
          <input ref={fileRef} type="file" accept="image/*" onChange={onUpload}
            className="w-full border rounded px-3 py-2" />
        </div>

        {/* texto */}
        <div>
          <h3 className="font-semibold mb-2">Añadir texto</h3>
          <input ref={textRef} type="text" placeholder="Texto"
            className="w-full border rounded px-3 py-2 mb-2" />
          <div className="flex gap-2 mb-2">
            <input ref={colorRef} type="color" defaultValue="#000000" />
            <select ref={fontRef} defaultValue="Arial"
              className="flex-1 border rounded px-2">
              {['Arial', 'Verdana', 'Times New Roman', 'Courier New',
                'Georgia', 'Impact', 'Comic Sans MS'].map(f => <option key={f}>{f}</option>)}
            </select>
            <input ref={sizeRef} type="number" min="8" max="120" defaultValue="24"
              className="w-20 border rounded px-2" />
          </div>
          <button onClick={addText}
            className="w-full bg-purple-500 hover:bg-purple-700 text-white py-2 rounded">
            Añadir texto
          </button>
        </div>

        {/* vista */}
        <div>
          <h3 className="font-semibold mb-2">Vista</h3>
          <div className="flex gap-4">
            <button onClick={() => setVista('front')} className={btnVista('front')}>
              Anverso
            </button>
            <button onClick={() => setVista('back')} className={btnVista('back')}>
              Reverso
            </button>
          </div>
        </div>

        {/* operaciones */}
        <div className="flex gap-2">
          <button onClick={undo}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded">
            Deshacer
          </button>
          <button onClick={deleteSelected}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded">
            Eliminar seleccionado
          </button>
        </div>

        <button onClick={addToCart} // <-- Aquí se adjunta el handler
          className="w-full bg-green-500 hover:bg-green-700 text-white py-3 rounded">
          Añadir al carrito
        </button>
      </aside>

      {/* lienzo */}
      <section className="w-full md:w-2/3 bg-gray-100 p-4 rounded-lg shadow-md flex justify-center items-center">
        <div className="relative w-[500px] h-[500px]">
          <img ref={tshirtRef} src={tshirtSrc()} alt="Base"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
          <canvas ref={canvasRef} width="500" height="500"
            className="relative z-10 border-2 border-dashed border-gray-400 bg-transparent" />
        </div>
      </section>
    </div>
  );
}
