import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import CircularProgress from '@mui/material/CircularProgress'
import './App.css'
import abi from './utils/WavePortal.json'
import { Box } from '@mui/material'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(false)
  const [success, setSuccess] = useState(false)
  const [count, setCount] = useState()
  const contractAddress = '0x1AAFEd605aabA52d3Bbb0E0582eCd5f0B8761404'

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
        setCurrentAccount(account)
      } else {
        console.log('No authorized account found')
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Implement your connectWallet method here
   */
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

        const waveTxn = await wavePortalContract.wave()
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

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div>
      <div className="mainContainer">
        <div className="dataContainer">
          <div>
            <div className="header">👋 Hey there!</div>
            <div className="bio">It`s my first web3 project!`</div>
            <div>Retrieved total wave count...{count?.toNumber()}</div>
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
      </div>
    </div>
  )
}

export default App
