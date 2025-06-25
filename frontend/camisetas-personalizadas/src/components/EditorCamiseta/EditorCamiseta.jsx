/* global fabric */
import React, { useRef, useState, useEffect, useCallback } from 'react';

export default function EditorCamiseta() {
  /* ───────── refs ───────── */
  const canvasRef  = useRef(null);
  const fabricRef  = useRef(null);
  const tshirtRef  = useRef(null);

  const textRef    = useRef(null);
  const colorRef   = useRef(null);
  const fontRef    = useRef(null);
  const sizeRef    = useRef(null);
  const fileRef    = useRef(null);

  /* ───────── historial ───────── */
  const history    = useRef([]);   // array de JSON
  const step       = useRef(-1);   // índice del estado actual
  const MAX_STEPS  = 20;

  const saveState = () => {
    if (!fabricRef.current) return;
    const json = fabricRef.current.toJSON();
    // corta rama futura si hemos deshecho
    history.current = history.current.slice(0, step.current + 1);
    history.current.push(json);
    if (history.current.length > MAX_STEPS) history.current.shift();
    step.current = history.current.length - 1;
  };

  const undo = () => {
    if (step.current <= 0) return;
    step.current -= 1;
    fabricRef.current.loadFromJSON(history.current[step.current], () =>
      fabricRef.current.requestRenderAll()
    );
  };

  const deleteSelected = () => {
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
  };

  /* ───────── state ───────── */
  const [tipo,   setTipo]   = useState('basica');
  const [genero, setGenero] = useState('hombre');
  const [talla,  setTalla]  = useState('M');
  const [vista,  setVista]  = useState('front');

  /* ───────── helpers ───────── */
  const tshirtSrc = useCallback(
    () => `/img/camiseta_${tipo}_${genero}_${vista}.png`,
    [tipo, genero, vista]
  );

  const loadFabricImage = (url) => {
    if (fabric.Image.fromURL.length >= 3) {
      return new Promise((res, rej) =>
        fabric.Image.fromURL(
          url,
          (img) => (img ? res(img) : rej(new Error('no image'))),
          { crossOrigin: 'anonymous' }
        )
      );
    }
    return fabric.Image.fromURL(url, { crossOrigin: 'anonymous' });
  };

  /* ───────── init canvas ───────── */
  useEffect(() => {
    if (!canvasRef.current) return;

    const c = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
      selection: true,
    });

    const box = canvasRef.current.parentElement;
    if (box) {
      c.setWidth(box.clientWidth);
      c.setHeight(box.clientHeight);
    }
    fabricRef.current = c;
    saveState();                        // estado inicial

    /* tecla Supr/Backspace */
    const keyHandler = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', keyHandler);

    return () => {
      window.removeEventListener('keydown', keyHandler);
      try { c.dispose(); } catch {}
    };
  }, []);

  /* ───────── cambia camiseta/vista ───────── */
  useEffect(() => {
    if (!fabricRef.current || !tshirtRef.current) return;

    tshirtRef.current.src = tshirtSrc();
    fabricRef.current.clear();
    fabricRef.current.requestRenderAll();
    saveState();                       // nuevo estado base para esta vista
  }, [tshirtSrc]);

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

    const box = new fabric.IText(value, {
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

  /* ───────── estilos botón vista ───────── */
  const btnVista = (side) =>
    `font-bold py-2 px-4 rounded text-white ${
      side === vista
        ? 'bg-blue-500 hover:bg-blue-700'
        : 'bg-gray-400 hover:bg-gray-600'
    }`;

  /* ───────── UI ───────── */
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* panel */}
      <aside className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md space-y-6">
        {/* tipo / género / talla (igual que antes) */}
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
            {['S','M','L','XL','XXL'].map(t => <option key={t}>{t}</option>)}
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
              {['Arial','Verdana','Times New Roman','Courier New',
                'Georgia','Impact','Comic Sans MS'].map(f => <option key={f}>{f}</option>)}
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

        <button className="w-full bg-green-500 hover:bg-green-700 text-white py-3 rounded">
          Añadir al carrito
        </button>
      </aside>

      {/* lienzo */}
      <section className="w-full md:w-2/3 bg-gray-100 p-4 rounded-lg shadow-md flex justify-center items-center">
        <div className="relative w-[500px] h-[500px]">
          <img ref={tshirtRef} src={tshirtSrc()} alt="Base"
               className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
          <canvas ref={canvasRef} width="500" height="500"
                  className="relative z-10 border-2 border-dashed border-gray-400 bg-transparent"/>
        </div>
      </section>
    </div>
  );
}
