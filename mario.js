/*
    8*8 像素每个图块
    2 bits 每个像素
    每个图块 16 bytes
*/
const log = console.log.bind(console)
let e = sel => document.querySelector(sel)

const actions = {
    change_offset(offset) {
        window.offset += offset
        e('h3').innerHTML = window.offset
        drawNes(window.bytes)
    },
} 

const bindEvent = () => {
    e('.control').addEventListener('click', event => {
        let action = event.target.dataset.action
        let offset = Number(event.target.dataset.offset)
        actions[action] && actions[action](offset)
    })
}

let ajax = request => {
    let r = new XMLHttpRequest()
    r.open('GET', request.url, true)
    r.responseType = 'arraybuffer'
    r.onreadystatechange = event => {
        if(r.readyState == 4) {
            request.callback(r.response)
        }
    }
    r.send()
}

const __main = () => {
    window.offset = 32784
    let tileOffset = 32784
    bindEvent()
    let request = {
        url: 'mario.nes',
        callback(r) {
            window.bytes = new Uint8Array(r)
            log('bytes', bytes)
            drawNes(bytes)

            setInterval(() => {
                drawSprite(bytes.slice(tileOffset))
                tileOffset += 128
                if(tileOffset == 33168) {
                    tileOffset = 32784
                }
            },1000 / 8)
        }
    }
    ajax(request)  
}

const drawNes = bytes => {
    let canvas = e('#id-canvas')
    let context = canvas.getContext('2d')
    // 一个图块8像素
    let blockSize = 8
    let pixelSize = 8
    let pixelWidth = 10
    let numberOfBytesPerBlock = 16

    for(let i = 0; i < blockSize; i++){
        for(let j=0; j< blockSize; j++) {
            // 算出bytes
            let x = j * pixelSize * pixelWidth
            let y = i * pixelSize * pixelWidth
            let index = window.offset + (i * 8 + j) * numberOfBytesPerBlock
            drawBlock(context, bytes.slice(index), x, y, pixelWidth)
        }
    }
}

const drawBlock = (context, data, x, y, pixelWidth) => {
    const colors = ['white', '#fe1000', '#ffb010', '#aa3030']
    let w = pixelWidth
    let h = pixelWidth
    for(let i = 0; i < 8; i++){
        let p1 = data[i]
        let p2 = data[i + 8]
        for(let j=0; j< 8; j++) {
            // 8 bits per line
            // 在 j 中每次画个像素点
            // 取颜色不理解
            let c1 = (p1 >> (7 - j)) & 0b00000001
            let c2 = (p2 >> (7 - j)) & 0b00000001
            let pixel = (c2 << 1) + c1
            let color = colors[pixel]
            context.fillStyle = color
            let px = x + j * w
            let py = y + i * h
            context.fillRect(px, py, w, h)
        }
    }
}

const drawSprite = data => {
    let context = e('#id-canvas-sprite').getContext('2d')
    let pixelPerBlock = 8
    let pixelWidth = 10
    let blockSize = pixelWidth * pixelPerBlock
    let offset = 0
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 2; j++){
            let x = j * blockSize
            let y = i * blockSize
            let pixels = data.slice(offset)
            drawBlock(context, pixels, x, y, pixelWidth)
            offset += 16
        }
    }
}
__main()