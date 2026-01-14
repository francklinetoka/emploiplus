import { useRef, useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PRESETS = [
  { id: 1, name: "Modèle A", layout: "left-image" },
  { id: 2, name: "Modèle B", layout: "top-image" },
  { id: 3, name: "Modèle C", layout: "full-image" },
];

export default function FlyerCreator() {
  const [title, setTitle] = useState("Titre du flyer");
  const [price, setPrice] = useState("25");
  const [description, setDescription] = useState("Description...");
  const [colorFrom, setColorFrom] = useState("#ffffff");
  const [colorTo, setColorTo] = useState<string | null>(null);
  const [align, setAlign] = useState("left");
  const [fontColor, setFontColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(20);
  const [preset, setPreset] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [texts, setTexts] = useState<{id:number, content:string, color:string, size:number, font:string, align:string}[]>([
    { id: 1, content: 'Titre principal', color: '#000000', size: 24, font: 'Montserrat', align: 'left' }
  ]);
  const [sizeW, setSizeW] = useState<number | null>(null);
  const [sizeH, setSizeH] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const addImage = (url: string) => {
    if (url) setImages((s) => [...s, url]);
  };

  const addTextBlock = () => {
    setTexts((t) => [...t, { id: Date.now(), content: 'Nouveau texte', color: '#000000', size: 16, font: 'Arial', align: 'left' }]);
  };

  const updateText = (id:number, patch:Partial<any>) => {
    setTexts((t)=> t.map(x => x.id===id? {...x, ...patch}: x));
  }

  const exportImage = async (type: "png" | "jpg") => {
    if (!user) {
      const payload = { path: location.pathname, format: type, design: { title, price, description, colorFrom, colorTo, align, fontColor, fontFamily, fontSize, preset, images, texts, sizeW, sizeH } };
      localStorage.setItem("pending_export_flyer", JSON.stringify(payload));
      navigate(`/connexion?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!canvasRef.current) return;
    const node = canvasRef.current;
    const canvas = await html2canvas(node, { scale: 2 });
    const mime = type === "png" ? "image/png" : "image/jpeg";
    const data = canvas.toDataURL(mime, 0.95);
    const a = document.createElement("a");
    a.href = data;
    a.download = `flyer-${Date.now()}.${type}`;
    a.click();
  };

  const sel = PRESETS.find((p) => p.id === preset) || PRESETS[0];

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const pending = localStorage.getItem("pending_export_flyer");
    if (pending && user) {
      try {
        const obj = JSON.parse(pending);
        if (obj.design) {
          setTitle(obj.design.title || title);
          setPrice(obj.design.price || price);
          setDescription(obj.design.description || description);
          setColorFrom(obj.design.colorFrom || colorFrom);
          setColorTo(obj.design.colorTo || colorTo);
          setAlign(obj.design.align || align);
          setFontColor(obj.design.fontColor || fontColor);
          setFontFamily(obj.design.fontFamily || fontFamily);
          setFontSize(obj.design.fontSize || fontSize);
          setPreset(obj.design.preset || preset);
          setImages(obj.design.images || images);
          setTexts(obj.design.texts || texts);
          setSizeW(obj.design.sizeW || sizeW);
          setSizeH(obj.design.sizeH || sizeH);
        }

        setTimeout(() => {
          exportImage(obj.format as 'png' | 'jpg');
        }, 500);

        localStorage.removeItem("pending_export_flyer");
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: 'Accueil', to: '/' }, { label: 'Services' }, { label: 'Création de flyers' }]} />

      <h1 className="text-2xl font-bold my-4">Création de flyers</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2">Modèle / Disposition</label>
          <div className="flex gap-2 mb-4">
            {PRESETS.map((p) => (
              <button key={p.id} onClick={() => setPreset(p.id)} className={`px-3 py-2 border rounded ${preset===p.id? 'border-primary':''}`}>
                {p.name}
              </button>
            ))}
          </div>

          <label className="block mb-2">Taille (présets)</label>
          <div className="flex gap-2 mb-3">
            <button onClick={()=>{setSizeW(600); setSizeH(800);}} className="px-3 py-2 border rounded">A4</button>
            <button onClick={()=>{setSizeW(420); setSizeH(595);}} className="px-3 py-2 border rounded">A5</button>
            <button onClick={()=>{setSizeW(315); setSizeH(470);}} className="px-3 py-2 border rounded">DL</button>
          </div>
          <label className="block mb-2">Taille personnalisée (px)</label>
          <div className="flex gap-2 mb-3">
            <input type="number" placeholder="width" value={sizeW || ''} onChange={(e)=>setSizeW(e.target.value?Number(e.target.value):null)} className="p-2 border rounded w-28" />
            <input type="number" placeholder="height" value={sizeH || ''} onChange={(e)=>setSizeH(e.target.value?Number(e.target.value):null)} className="p-2 border rounded w-28" />
          </div>

          <label className="block mb-2">Titre</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full p-2 border rounded mb-3" />

          <label className="block mb-2">Prix</label>
          <input value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full p-2 border rounded mb-3" />

          <label className="block mb-2">Description</label>
          <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full p-2 border rounded mb-3" />

          <label className="block mb-2">Couleur de fond ou dégradé</label>
          <div className="flex gap-2 mb-3">
            <input type="color" value={colorFrom} onChange={(e)=>setColorFrom(e.target.value)} />
            <input type="color" value={colorTo || '#ffffff'} onChange={(e)=>setColorTo(e.target.value)} />
            <button onClick={()=>setColorTo(null)} className="px-2 py-1 border rounded">Couleur unique</button>
          </div>

          <label className="block mb-2">Couleur police</label>
          <input type="color" value={fontColor} onChange={(e)=>setFontColor(e.target.value)} className="mb-3" />

          <label className="block mb-2">Police</label>
          <select value={fontFamily} onChange={(e)=>setFontFamily(e.target.value)} className="w-full p-2 border rounded mb-3">
            <option>Arial</option>
            <option>Helvetica</option>
            <option>Georgia</option>
            <option>Montserrat</option>
          </select>

          <label className="block mb-2">Alignement</label>
          <select value={align} onChange={(e)=>setAlign(e.target.value)} className="w-full p-2 border rounded mb-3">
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>

          <label className="block mb-2">Taille police</label>
          <input type="range" min={12} max={48} value={fontSize} onChange={(e)=>setFontSize(Number(e.target.value))} className="w-full mb-3" />

          <label className="block mb-2">Ajouter images (URL)</label>
          <ImageAdder onAdd={addImage} />
          <div className="mt-2 flex gap-2 flex-wrap">
            {images.map((s, i)=> <img key={i} src={s} className="h-16 w-24 object-cover rounded" />)}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-medium">Blocs de texte</label>
              <button onClick={addTextBlock} className="px-2 py-1 border rounded">Ajouter</button>
            </div>
            {texts.map(t=> (
              <div key={t.id} className="p-2 border rounded mb-2">
                <input value={t.content} onChange={(e)=>updateText(t.id, { content: e.target.value })} className="w-full p-2 border rounded mb-2" />
                <div className="flex gap-2">
                  <input type="color" value={t.color} onChange={(e)=>updateText(t.id, { color: e.target.value })} />
                  <input type="number" value={t.size} min={8} max={72} onChange={(e)=>updateText(t.id, { size: Number(e.target.value) })} className="w-20" />
                  <select value={t.font} onChange={(e)=>updateText(t.id, { font: e.target.value })}>
                    <option>Arial</option>
                    <option>Montserrat</option>
                    <option>Georgia</option>
                  </select>
                  <select value={t.align} onChange={(e)=>updateText(t.id, { align: e.target.value })}>
                    <option value="left">Gauche</option>
                    <option value="center">Centre</option>
                    <option value="right">Droite</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={()=>exportImage('png')}>Exporter PNG</Button>
            <Button onClick={()=>exportImage('jpg')}>Exporter JPG</Button>
          </div>
        </div>

        <div>
            <div ref={canvasRef} className={`p-6 rounded shadow-lg`} style={{ background: colorTo ? `linear-gradient(135deg, ${colorFrom}, ${colorTo})` : colorFrom, minHeight: 420, width: sizeW || 420, height: sizeH || 600 }}>
                <div style={{ color: fontColor, fontFamily }} className={`${align}`}>
                  {texts.map(tx => (
                    <div key={tx.id} style={{ color: tx.color, fontSize: tx.size, fontFamily: tx.font, textAlign: tx.align }} className="mb-2">{tx.content}</div>
                  ))}
                  <p className="font-semibold">Prix: {price} USD</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {images.map((s, i)=> <img key={i} src={s} alt={`img-${i}`} className="max-h-48 object-cover" />)}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
