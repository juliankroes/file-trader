import { useEffect, useState } from 'react'
import './App.css'
import useWebSocket from 'react-use-websocket'
import traderImage from './assets/trader.gif'

interface storedFile {
  rawData: ArrayBuffer,
  filename: string,
  type: string
}

function App() {
  const url = 'https://juliankroes-file-trade-73.deno.dev/start_web_socket'
  // const url = 'http://localhost:6969/start_web_socket'
  const { sendMessage, lastMessage } = useWebSocket(url);
  const [newFile, setNewFile] = useState<storedFile | null>(null)
  const [uploadedFile, setUploadedFile] = useState<boolean>(false)
  const [downloadedFile, setDownloadedFile] = useState<boolean>(false)


  useEffect(() => {
    if (lastMessage !== null) {
      if (lastMessage.data == 'undefined') {
        return
      }
      console.log(lastMessage)
      const retrievedFile = JSON.parse(lastMessage.data)
      
      // Make sure rawData is converted back to a Uint8Array
      const file: storedFile = {
        rawData: new Uint8Array(retrievedFile.data).buffer, // convert back to ArrayBuffer
        type: retrievedFile.type,
        filename: retrievedFile.filename
      }
      
      console.log(file)
      setNewFile(file)
    }
  }, [lastMessage])

  function download(file: storedFile) {
    console.log(`Downloading file: ${file.type}`)
    
    // Convert array back into Uint8Array
    const uint8Array = new Uint8Array(file.rawData)
    const blob = new Blob([uint8Array], { type: file.type })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.filename

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setDownloadedFile(true)
  }
  

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUploadedFile(true)
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    const file = files[0]
    console.log("sending file:", file)
  
    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      const message = {
        type: file.type,
        filename: file.name,
        data: Array.from(new Uint8Array(arrayBuffer))
      }
      
      sendMessage(JSON.stringify(message))
    }
  
    reader.readAsArrayBuffer(file)
  }

  return (
    <>
      <div>
        <div className='container'>
          <h1>file trader</h1>
          <h2>1. upload file</h2>
          <input id='file-upload' type="file" onChange={handleFileSelected} />
          {
            uploadedFile && !newFile
            ? <div className="spinner-border" role="status"><br /><span className="sr-only"><img width="40px" src="https://discuss.wxpython.org/uploads/default/original/2X/6/6d0ec30d8b8f77ab999f765edd8866e8a97d59a3.gif" alt="" /></span></div> 
            : null
          } 
          {
            newFile ? 
            <><h2>2. Download a file</h2><button className='btn btn-primary' onClick={() => download(newFile)}>download {newFile.filename}</button></>
            : null
          }
          {
            downloadedFile ?
            <><h2>3. enjoy your traded file!</h2><i className='note'>I am not responsible for any malware, illegal content or other harmful files you might recieve.</i></>
            : null
          }
        </div>
        <img src={traderImage} alt="trader" className='trader' />
      </div>
    </>
  )
}
export default App