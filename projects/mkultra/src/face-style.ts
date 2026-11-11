import {DIRECTOR} from './engine/director';
import { Pen } from './engine/toon';

export const FACE_COLOR = DIRECTOR.character.faceBase;
export const FACE_SHADOW = DIRECTOR.character.faceShadow;

// Keep clothing gradients; substitute only the off-white facial edge shade.
export class CharacterPen extends Pen {
  private headOutlinePending = false;
  override gradFill(...args:Parameters<Pen['gradFill']>){
    super.gradFill(...args);
    const [points,,,light]=args;
    const ys=points.map(p=>p[1]),xs=points.map(p=>p[0]);
    const top=Math.min(...ys),height=Math.max(...ys)-top,width=Math.max(...xs)-Math.min(...xs);
    // Seeded head proportions move the shoulder upward; do not reject valid tall torsos.
    if(Math.max(...ys)<480 || height<80 || width<65)return;
    const left=Math.cos(light)<0;
    // Follow the actual coat silhouette, inset from its ink; both ends close to a point.
    const ribbon=(size:number,color:string)=>{
      const outer:[number,number][]=[],inner:[number,number][]=[];
      for(let i=0;i<=64;i++){
        const t=i/64,y=top+height*(.08+.86*t),hits:number[]=[];
        for(let j=0;j<points.length;j++){
          const a=points[j],b=points[(j+1)%points.length];
          if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))hits.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
        }
        if(!hits.length)continue;
        const edge=left?Math.min(...hits):Math.max(...hits),sign=left?1:-1;
        const x=edge+sign*width*DIRECTOR.character.bodyRimInset,half=size*Math.pow(Math.sin(Math.PI*t),.8)/2;
        outer.push([x-sign*half,y]);inner.push([x+sign*half,y]);
      }
      this.path([...outer,...inner.reverse()],true);this.g.fillStyle=color;this.g.fill();
    };
    this.clip(points,()=>{
      const g=this.g;g.save();g.shadowColor='#d8e7ff';g.shadowBlur=width*.02;
      ribbon(width*DIRECTOR.character.bodyGlowWidth,'rgba(219,234,255,.32)');g.shadowBlur=width*.006;
      ribbon(width*DIRECTOR.character.bodyRimWidth,'rgba(255,250,242,.93)');g.restore();
    });
  }
  override shadedFill(...args: Parameters<Pen['shadedFill']>) {
    const face=[FACE_COLOR,'#f7f6f2','#faf9f6','#f5f4f0'].includes(args[1]);
    if (face) args[2] = FACE_SHADOW;
    super.shadedFill(...args);
    const [contour]=args;
    const xs=contour.map(p=>p[0]),ys=contour.map(p=>p[1]);
    const left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top;
    if(!face && Math.max(...ys)<490 && width>100 && height>30){
      // Gloss belongs to hair/headwear: a curved tapered ribbon, not a face halo.
      this.clip(contour,()=>{
        const ribbon=(thickness:number,color:string)=>{
          const upper:[number,number][]=[],lower:[number,number][]=[];
          for(let i=0;i<=48;i++){
            const t=i/48,u=1-t;
            const x=left+width*(.1*u*u*u+3*.29*u*u*t+3*.66*u*t*t+.9*t*t*t);
            const y=top+height*(.65*u*u*u+3*.02*u*u*t+3*.01*u*t*t+.34*t*t*t);
            const half=thickness*Math.pow(Math.sin(Math.PI*t),.65)/2;
            upper.push([x,y-half]);lower.push([x,y+half]);
          }
          this.path([...upper,...lower.reverse()],true);this.g.fillStyle=color;this.g.fill();
        };
        const g=this.g;g.save();g.shadowColor='#fff4e6';g.shadowBlur=width*.026;
        ribbon(width*.055,'rgba(255,237,224,.32)');g.shadowBlur=width*.008;
        ribbon(width*DIRECTOR.character.hairReflectionWidth,'#fff9f3');g.shadowBlur=0;
        this.ell(left+width*.55,top+height*.38,width*.055,height*.09,'rgba(255,245,239,.13)',0);
        g.restore();
      });
    }
    if(face){
      // A pearl light layer inside the actual bean contour, before ink and facial features.
      const [points,,,,radius]=args;
      this.clip(points,()=>{
        const g=this.g;g.save();this.path(points,true);
        g.strokeStyle='#fffafd';g.lineWidth=radius*.25;
        g.shadowColor='#fff0dc';g.shadowBlur=radius*.055;g.stroke();g.restore();
      });
      this.headOutlinePending=true;
    }
  }
  override inkRing(...args:Parameters<Pen['inkRing']>){
    if(this.headOutlinePending){args[1]*=DIRECTOR.character.headOutlineScale;args[3]=DIRECTOR.character.headOutlineTaper;this.headOutlinePending=false;}
    super.inkRing(...args);
  }
}
