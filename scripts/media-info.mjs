// Read the canvas dimensions from the WebP container without runtime dependencies.
export function webpDimensions(buffer){
 if(buffer.length<20||buffer.toString('ascii',0,4)!=='RIFF'||buffer.toString('ascii',8,12)!=='WEBP')throw new Error('Not a WebP container');
 for(let offset=12;offset+8<=buffer.length;){
  const type=buffer.toString('ascii',offset,offset+4),length=buffer.readUInt32LE(offset+4),data=offset+8;
  if(data+length>buffer.length)throw new Error('Truncated WebP chunk');
  if(type==='VP8X'&&length>=10)return [1+buffer.readUIntLE(data+4,3),1+buffer.readUIntLE(data+7,3)];
  if(type==='VP8 '&&length>=10){if(buffer[data+3]!==0x9d||buffer[data+4]!==0x01||buffer[data+5]!==0x2a)throw new Error('Invalid VP8 frame');return [buffer.readUInt16LE(data+6)&0x3fff,buffer.readUInt16LE(data+8)&0x3fff];}
  if(type==='VP8L'&&length>=5){if(buffer[data]!==0x2f)throw new Error('Invalid VP8L signature');const bits=buffer.readUInt32LE(data+1);return [(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1];}
  offset=data+length+(length%2);
 }
 throw new Error('WebP has no supported dimension chunk');
}
