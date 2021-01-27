class View {
  constructor () {

  }

  createVideoElement({ muted = true, src, srcObject }) {
    const video = document.createElement('video')
    video.muted = muted
    video.src = src
    video.srcObject = srcObject

    if(src) {
      video.controls = true
      video.loop = true
      // não necessário importar pq já foi feito no html
      Util.sleep(200).then(_ => video.play())
    }

    if(srcObject) {
      video.addEventListener("loadedmetadata", _ => video.play())
    }

    return video
  }

  renderVideo ({ userId, stream = null, url = null, isCurrentId = false }) {
    const video = this.createVideoElement({ src: url, srcObject: stream })
    this.appendtoHTMLTree(userId, video, isCurrentId)
  }

  appendtoHTMLTree(userId, video, isCurrentId) {
    const div = document.createElement('div')
    div.id = userId
    div.classList.add('wrapper')
    div.append(video)

    const div2 = document.createElement('div')
    div2.innerHTML = isCurrentId ? '' : userId
    div.append(div2)

    const videoGrid = document.getElementById('video-grid')

    videoGrid.append(div)
  }
}