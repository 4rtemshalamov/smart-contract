import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import CircularProgress from '@mui/material/CircularProgress'
import './App.css'
import abi from './utils/WavePortal.json'
import { Box, TextField } from '@mui/material'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [allWaves, setAllWaves] = useState([])
  const [loader, setLoader] = useState(false)
  const [success, setSuccess] = useState(false)
  const [count, setCount] = useState()
  const [message, setMessage] = useState()
  const contractAddress = '0x0dEA802C45Bf798c3fbd93447E6225C21E74332b'

  const contractABI = abi.abi

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Make sure you have metamask!')
        return
      } else {
        console.log('We have the ethereum object', ethereum)
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account:', account)
        getAllWaves()
        setCurrentAccount(account)
      } else {
        console.log('No authorized account found')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      let count = await wavePortalContract.getTotalWaves()
      setCount(count)
      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())

        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        })
        if (Boolean(waveTxn)) {
          setLoader(true)
        }
        console.log('Mining...', waveTxn.hash)

        const isMined = await waveTxn.wait()
        if (Boolean(isMined)) {
          setLoader(false)
          setSuccess(true)

          console.log('Mined -- ', waveTxn.hash)
        }

        count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', count.toNumber())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        const waves = await wavePortalContract.getAllWaves()

        let wavesCleaned = []
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          })
        })

        setAllWaves(wavesCleaned)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  useEffect(() => {
    let wavePortalContract

    const onNewWave = (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message)
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      )
      wavePortalContract.on('NewWave', onNewWave)
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave)
      }
    }
  }, [])

  return (
    <div>
      <div className="mainContainer">
        <div className="dataContainer">
          <div>
            <div className="header">👋 Hey there!</div>
            <div className="bio">It`s my first web3 project!</div>
            <div>
              <span>Retrieved total wave count...</span>
              <span>{Boolean(count) && count.toNumber()}</span>
            </div>
            <TextField
              id="standard-basic"
              label="Standard"
              color="primary"
              backgroundColor="white"
              onChange={(e) => setMessage(e.target.value)}
            />
            {/* {message && <div>{message}</div>} */}

            {!currentAccount && (
              <button className="waveButton" onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        {loader && (
          <Box>
            <CircularProgress />
          </Box>
        )}
        {success ? (
          <div>
            <div className="header">
              👋 Heeeey eeeeee! It was success! Nice work!
            </div>
            <button className="waveButton" onClick={() => setSuccess(false)}>
              Try again?
            </button>
          </div>
        ) : (
          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: 'OldLace',
                marginTop: '16px',
                padding: '8px',
              }}
            >
              <div style={{ color: 'black' }}>Address: {wave.address}</div>
              <div style={{ color: 'black' }}>
                Time: {wave.timestamp.toString()}
              </div>
              <div style={{ color: 'black' }}>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
