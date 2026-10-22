export function telephoneHref(value){
 if(typeof value!=='string'||!/^[+\d ()-]+$/.test(value))return null;
 const normal=value.replace(/[ ()-]/g,'');
 return /^\+?\d{7,15}$/.test(normal)?'tel:'+normal:null;
}
