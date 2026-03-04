export async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const maxSize = 2000
        let w = img.width
        let h = img.height
  
        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = Math.round((h * maxSize) / w)
            w = maxSize
          } else {
            w = Math.round((w * maxSize) / h)
            h = maxSize
          }
        }
  
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
  
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            if (blob) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
              }))
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          0.85
        )
      }
      img.src = url
    })
  }