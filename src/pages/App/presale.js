import React, { useState, useCallback, useEffect } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import IconButton from '@mui/material/IconButton';
import { Reveal } from 'react-awesome-reveal';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Link } from '@reach/router';

import SelectCoin from '../../components/app/SelectCoin';
import ConnectWallet from '../../components/menu/ConnectWallet';
import Clock from '../../components/app/Clock';
import { numberWithCommas, IsSmMobile, fadeInUp, fadeIn, getUTCNow, getUTCDate, isEmpty } from '../../utils';
import { useSigningClient } from '../../context/web3Context';
import { config, def_config } from '../../config';
import './app.scss';

const MAX_AMOUNT = def_config.MAX_PRESALE_AMOUNT;
const CACO_COIN = [
  { code: 2, label: 'CACO' },
];

const PresaleBody = () => {
  const {
    web3,
    pending,
    balance,
    getStartPresaleTime,
    getEndPresaleTime,
    getTotalPresaleAmount,
    getMaxPresaleCap,
    getMinPresaleCap,
    getpTokenPriceForBUSD,
    getBNBForBUSD,
    getBUSDForBNB,
    getUserPaidBUSD,
    buy_pToken
  } = useSigningClient();

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [deadLine, setDeadLine] = useState(0);
  const [leftCap, setLeftCap] = useState('');
  const [maxCap, setMaxCap] = useState(0);
  const [minCap, setMinCap] = useState(0);
  const [maxTotalCap, setMaxTotalCap] = useState('');
  const [amountPercent, setAmountPercent] = useState(0);
  const [curPresale, setCurPresale] = useState('');
  const [capPercent, setCapPercent] = useState('');
  const [busdPrice, setBusdPrice] = useState('');
  const [paidBUSD, setPaidBUSD] = useState(0);
  const [pCACOAmount, setPCACOAmount] = useState(0);
  const [toBNBPrice, setToBNBPrice] = useState(0);
  const [maxBNBCap, setMaxBNBCap] = useState('');
  const [coinType, setCoinType] = useState(0);
  const [startPresale, setStartPresale] = useState(false);

  const [tokenAmountA, setTokenAmountA] = useState('');
  const [fromBalance, setFromBalance] = useState(0);
  const [toBalance, setToBalance] = useState(0);
  const [ended, setEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!web3) return;
    setLoading(true);
    let start_time = 0;
    let end_time = 0;
    let result = await getStartPresaleTime();
    if (result.success) {
      start_time = Number(result.start_time);
      setStartTime(start_time);
      if (start_time * 1000 > getUTCNow()) {
        setDeadLine(start_time);
      }
    } else {
      return;
    }
    result = await getEndPresaleTime();
    if (result.success) {
      end_time = Number(result.end_time);
      setEndTime(end_time);
      if (end_time * 1000 > getUTCNow() && start_time * 1000 < getUTCNow()) {
        setDeadLine(end_time);
      }
    }

    let tempBusdPrice = 0;
    let totalMaxCap = 0;
    let tempPaidBUSD = 0;
    let tempCurPresale = 0;
    let tempLeftCap = 0;
    result = await getpTokenPriceForBUSD();
    if (result.success) {
      setBusdPrice(result.busdPrice);
      tempBusdPrice = Number(result.busdPrice);
    }
    result = await getTotalPresaleAmount();
    if (result.success) {
      const percent = ((MAX_AMOUNT - Number(result.presaleAmount)) * 100) / MAX_AMOUNT;
      setAmountPercent(percent);
      tempCurPresale = (MAX_AMOUNT - Number(result.presaleAmount)) * tempBusdPrice;
      setCurPresale(tempCurPresale);
      tempLeftCap = MAX_AMOUNT * tempBusdPrice - tempCurPresale;
      setLeftCap(tempLeftCap);
    }
    result = await getUserPaidBUSD();
    if (result.success) {
      tempPaidBUSD = Number(result.paidBUSD);
      setPaidBUSD(tempPaidBUSD);
    }

    result = await getMaxPresaleCap();
    if (result.success) {
      totalMaxCap = Number(result.maxCap);
      setMaxTotalCap(totalMaxCap);
      const percent = (Number(tempPaidBUSD) * 100) / totalMaxCap;
      setCapPercent(percent);
      if (percent >= 0) {
        let tempMaxCap = totalMaxCap - tempPaidBUSD;
        if (tempMaxCap < 1) {
          tempMaxCap = 0;
          setCapPercent(100);
        }

        if (tempLeftCap < tempMaxCap) {
          tempMaxCap = tempLeftCap;
        }
        if (tempMaxCap < 1) {
          tempLeftCap = 0;
          setLeftCap(tempLeftCap);
        }
        setMaxCap(tempMaxCap);
        if (tempMaxCap > 0) {
          result = await getBNBForBUSD(tempMaxCap);
          if (result.success) {
            setMaxBNBCap(Number(result.value))
          }
        } else {
          setMaxBNBCap(0)
        }
      }
    }

    if (start_time > 0 && start_time * 1000 > getUTCNow()) {
      setStartPresale(false);
    } else if (start_time > 0 && end_time > 0 && start_time * 1000 < getUTCNow() && end_time * 1000 > getUTCNow()) {
      setStartPresale(true);
    }
    setLoading(false);
    // Condition - how much did the user pay and check the left max cap
    if (totalMaxCap <= tempPaidBUSD || tempLeftCap <= 0) {
      return;
    }
    result = await getMinPresaleCap();
    if (result.success) {
      let resMinCap = Number(result.minCap);
      setMinCap(resMinCap);
    }
  }, [web3]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCoin = async (e, value) => {
    setCoinType(value);

    const fromToken = Number(tokenAmountA);
    if (fromToken === 0) {
      return;
    }
    if (value === 0) {
      const result = await getBUSDForBNB(fromToken);
      if (result.success) {
        setToBNBPrice(result.value);
        setPCACOAmount(Number(result.value) / busdPrice);
      }
    } else {
      setPCACOAmount(fromToken / busdPrice);
    }
  }

  const handleChange = async (event) => {
    const value = Number(event.target.value);
    setTokenAmountA(event.target.value);
    if (value === 0) {
      setPCACOAmount(0);
      setToBNBPrice(0);
      return;
    }
    if (coinType === 0) {
      const result = await getBUSDForBNB(value);
      if (result.success) {
        setToBNBPrice(result.value);
        setPCACOAmount(Number(result.value) / busdPrice);
      }
    } else {
      setPCACOAmount(value / busdPrice);
    }
  }

  const validate = () => {
    if (isEmpty(tokenAmountA) || Number(tokenAmountA) === 0) {
      toast.error("Please enter a valid amount for purchase.");
      return;
    }
    const purchasePrice = (Number(pCACOAmount) + Number(balance.CACO)) * Number(busdPrice);
    if (purchasePrice < Number(minCap)) {
      toast.error('Please enter a valid amount for purchase. The minimum amount you can buy is $10 and the maximum is $10,000 during Presale.');
      return;
    }

    if (purchasePrice > Number(maxCap)) {
      toast.error('Please enter a valid amount for purchase. The minimum amount you can buy is $10 and the maximum is $10,000 during Presale.');
      return;
    }

    if ((coinType === 0 && Number(balance.BNB) < Number(tokenAmountA)) || (coinType === 1 && Number(balance.BUSD) < Number(tokenAmountA))) {
      toast.error("You have insufficient amount to buy CACO.");
      return false;
    }
    if (Number(startTime) * 1000 > getUTCNow()) {
      toast.error("Presale has not started yet.");
      return false;
    } else if (Number(endTime) * 1000 < getUTCNow()) {
      toast.error("Presale has ended.");
      return false;
    }
    return true;
  }

  const handleMax = async () => {
    const value = coinType === 0 ? Number(balance.BNB) : Number(balance.BUSD);
    setTokenAmountA(value);
    if (value === 0) {
      setPCACOAmount(0);
      setToBNBPrice(0);
      return;
    }
    if (coinType === 0) {
      const result = await getBUSDForBNB(value);
      if (result.success) {
        setToBNBPrice(result.value);
        setPCACOAmount(Number(result.value) / busdPrice);
      }
    } else {
      setPCACOAmount(value / busdPrice);
    }
  }

  const handleBuy = async () => {
    if (!validate()) return;
    try {
      const coinAmount = tokenAmountA;
      const result = await buy_pToken(coinAmount, pCACOAmount, coinType);
      if (result.success) {
        loadData();
        Swal.fire({
          icon: 'success',
          title: ' Success',
          text: 'You have bought CACO for presale successfully.'
        });
        setTokenAmountA(0);
        setPCACOAmount(0);
      }
    } catch (error) {
      toast.error("Transaction has been failed. " + error);
    }
  }

  useEffect(() => {
    const checkCoinType = async () => {
      if (coinType === 0) {
        setFromBalance(balance.BNB);
      } else {
        setFromBalance(balance.BUSD);
      }
      setToBalance(balance.CACO);
    }
    checkCoinType();
  }, [balance, coinType]);

  useEffect(() => {
    const checkEndPresale = async () => {
      const result = await getEndPresaleTime();
      if (result.success) {
        setEndTime(result.end_time);
      }
    }
    if (ended) {
      checkEndPresale();
    }
  }, [ended]);

  return (
    <div className='app-body'>
      <Reveal keyframes={fadeInUp} className='onStep' delay={400} duration={1000} triggerOnce>
        <div className='row'>
          <div className='w-1/2 xl:w-full'>
            <div className='app-card'>
              <div className='app-card-header'>
                {loading && (
                  <span className='text-[20px]'>&nbsp;</span>
                )}
                {!loading && (leftCap === 0 || (endTime > 0 && endTime * 1000 < getUTCNow())) && (
                  <span className='text-[20px]'>Successfully presale has ended!</span>
                )}
                {!loading && leftCap > 0 && startTime > 0 && startTime * 1000 > getUTCNow() && (
                  <span className='text-[20px]'>Presale will be started soon!</span>
                )}
                {!loading && leftCap > 0 && startTime > 0 && endTime > 0 && startTime * 1000 < getUTCNow() && endTime * 1000 > getUTCNow() && (
                  <span className='text-[20px]'>Time Remaining to particiate in presale</span>
                )}
              </div>
              <div className='app-card-body'>
                <div className='app-subcard'>
                  <Clock start={startPresale} deadline={deadLine * 1000} setEnded={setEnded} />
                </div>
              </div>
              <div className='app-card-footer'>
                <div className='flex justify-between'>
                  <div className='flex flex-col'>
                    <span className='app-gray text-[14px]'>Start Time:</span>
                    <span className='text-white text-[16px]'>{startTime === 0 ? '--' : getUTCDate(startTime)}</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='app-gray text-[14px]'>End Time:</span>
                    <span className='text-white text-[16px]'>{endTime === 0 ? '--' : getUTCDate(endTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='w-1/2 xl:w-full xl:mt-[20px]'>
            <div className='app-card'>
              <div className='app-card-header'>
                <span className='text-[20px]'>Please Enter The CACO Amount</span>
              </div>
              <div className='app-card-body'>
                <div className='flex flex-row sm:!flex-col justify-between items-center'>
                  <div className='flex-1 sm:w-full'>
                    <div className='app-subcard !px-[15px] !py-[10px]'>
                      <div className='flex justify-between'>
                        <span className='app-color text-[14px] font-bold'>From</span>
                        <span className='app-yellow text-[14px] font-bold'>Balance: {numberWithCommas(Number(fromBalance))}</span>
                      </div>
                      <button className='app-brown text-[14px] text-right my-1 font-bold' onClick={handleMax}>MAX</button>
                      <div className='flex justify-between'>
                        <input type="number" className="input-token" name="input_from" placeholder='0.0' value={tokenAmountA} onChange={handleChange}></input>
                        <SelectCoin className='select-coin' value={coinType} onChange={handleCoin} />
                      </div>
                    </div>
                  </div>
                  <IconButton component="span" className="flex-none width-1 w-[40px] h-[40px] m-2 text-white">
                    {IsSmMobile() ? (
                      <i className="fa-solid fa-arrow-down"></i>
                    ) : (
                      <i className="fa-solid fa-arrow-right"></i>
                    )}

                  </IconButton>
                  <div className='flex-1 sm:w-full'>
                    <div className='app-subcard !px-[15px] !py-[10px]'>
                      <div className='flex justify-between'>
                        <span className='app-color text-[14px] font-bold'>To</span>
                        <span className='app-yellow text-[14px] font-bold'>Balance: {numberWithCommas(Number(toBalance))}</span>
                      </div>
                      <button className='app-color text-[14px] text-right my-1 font-bold'>&nbsp;</button>
                      <div className='flex justify-between'>
                        <p className="input-token mb-0">{numberWithCommas(pCACOAmount)}&nbsp;
                          {coinType === 0 && (
                            <span>{toBNBPrice === 0 ? '' : ' ($' + numberWithCommas(Number(toBNBPrice), 4) + ')'}</span>
                          )}
                        </p>
                        <SelectCoin className='select-coin' value={2} coins={CACO_COIN} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='app-card-footer'>
                <div className='flex flex-col text-center'>
                  <p className='app-gray text-[15px] sm:text-[14px]'>CACO remaining for your wallet limit: {maxCap === '' || busdPrice === '' ? '' : numberWithCommas(maxCap / Number(busdPrice))}
                    {coinType === 0 ? ` (${numberWithCommas(maxBNBCap)} BNB)` : ` ($${numberWithCommas(maxCap)} BUSD)`}</p>
                  <span className='text-white text-[16px] sm:text-[15px]'>Minimum Per Transaction is $10, Maximum For Presale is $10,000</span>
                </div>
                <div className='flex justify-center mt-3'>
                  <LoadingButton
                    onClick={handleBuy}
                    endIcon={<></>}
                    loading={pending}
                    loadingPosition="end"
                    variant="contained"
                    className="btn-main3"
                    disabled={!(startTime > 0 && endTime > 0 && startTime * 1000 < getUTCNow() && endTime * 1000 > getUTCNow())}
                  >
                    BUY CACO
                  </LoadingButton>
                </div>
              </div>
            </div>
          </div>
          <div className='w-full mt-[20px]'>
            <div className='app-card'>
              <div className='app-card-header text-center'>
                <p className='text-[20px] sm:text-[15px]'>With A Presale Price Of 0.01 BUSD. Our Minimum Limit Will Be $10 BUSD And <br /> A Max Of $10,000 BUSD. See Our Whitepaper For Further Details.</p>
              </div>
              <div className='app-card-body'>
                <div className="row justify-center">
                  <div className="col-md-6">
                    <div className="amount_bar px-3">
                      <div className="loading-bar my-3 position-relative">
                        <div className="progres-area pt-5 pb-2">
                          <ul className="progress-top">
                            <li></li>
                            <li className="pre-sale">25%</li>
                            <li>50%</li>
                            <li className="bonus">75%</li>
                            <li></li>
                          </ul>
                          <ul className="progress-bars">
                            <li></li>
                            <li>|</li>
                            <li>|</li>
                            <li>|</li>
                            <li></li>
                          </ul>
                          <div className="progress">
                            <div className="progress-bar progress-bar-custom" role="progressbar" style={{ width: `${numberWithCommas(amountPercent, 2)}%` }} aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                          </div>
                          <div className='progress-amount' style={{ left: `calc(${numberWithCommas(amountPercent, 2)}% - 10px)` }}>
                            <span>{numberWithCommas(amountPercent, 1)}%</span>
                          </div>
                          <div className="progress-bottom">
                            <div className="progress-info">Presale Amount received</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="amount_bar px-3">
                      <div className="loading-bar my-3 position-relative">
                        <div className="progres-area pt-5 pb-2">
                          <ul className="progress-top">
                            <li></li>
                            <li className="pre-sale">25%</li>
                            <li>50%</li>
                            <li className="bonus">75%</li>
                            <li></li>
                          </ul>
                          <ul className="progress-bars">
                            <li></li>
                            <li>|</li>
                            <li>|</li>
                            <li>|</li>
                            <li></li>
                          </ul>
                          <div className="progress">
                            <div className="progress-bar progress-bar-custom" role="progressbar" style={{ width: `${numberWithCommas(capPercent, 2)}%` }} aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                          </div>
                          <div className='progress-amount' style={{ left: `calc(${numberWithCommas(capPercent, 2)}% - 10px)` }}>
                            <span>{numberWithCommas(capPercent, 1)}%</span>
                          </div>
                          <div className="progress-bottom">
                            <div className="progress-info text-center">Your Hard Cap Amount</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='app-card-footer'>
                <div className='flex justify-around sm:flex-col sm:text-center'>
                  <div className='flex flex-col'>
                    <span className='app-gray text-[14px]'>Presale Amount Received:</span>
                    <span className='text-white text-[16px]'>{curPresale === '' ? '--' : '$' + numberWithCommas(curPresale) + ' BUSD'}</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='app-gray text-[14px]'>Maximum Presale Amount Allocated:</span>
                    <span className='text-white text-[16px]'>{busdPrice === '' ? '--' : '$' + numberWithCommas(MAX_AMOUNT * Number(busdPrice)) + ' BUSD'}</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='app-gray text-[14px]'>CACO Price:</span>
                    <span className='text-white text-[16px]'>{busdPrice === '' ? '--' : '$' + numberWithCommas(Number(busdPrice)) + ' BUSD'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

const Presale = () => {

  const addTokenCallback = useCallback(async () => {
    const tokenAddress = config.CACO_CONTRACT;
    const tokenSymbol = 'CACO';
    const tokenDecimals = 18;
    const tokenImage = ``;

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });

      if (wasAdded) {
        console.log('Adding CACO token');
      } else {
        console.log('CACO token has been added to you wallet!')
      }
    } catch (error) {
      console.log(error);
    }
  }, [])

  return (
    <div className='app-full'>
      {/* <Sidebar path="presale" /> */}
      <div className='app-container'>
        <div className='app-star-group'>
        </div>
        <div className='app-header xl:items-center sm:flex-col'>
          <Reveal keyframes={fadeInUp} className='onStep' delay={0} duration={800} triggerOnce>
            <div className='app-title flex gap-2 items-center'>
              <div>
                <a className='cursor-pointer' href='https://cacotoken.com/'>
                  <img alt='' src={'/images/logo/logo.png'} width={100} />
                </a>
              </div>
              <div>
                <p className='text-[26px] sm:text-center text-black font-bold'><span className='text-[30px] text-black'>$CACO</span> PRESALE</p>
                <p className='text-[20px] xl:hidden text-[#c7a5a5]'>Powered By <span className='text-[24px] text-white'>CANE CORSO</span>. You Can Participate Using <span className='text-[24px] text-white'>BNB</span> Or <span className='text-[24px] text-white'>BUSD</span></p>
              </div>
            </div>
          </Reveal>
          <Reveal keyframes={fadeIn} className='onStep' delay={0} duration={1000} triggerOnce>
            <div className='flex gap-4 items-center'>
              <button className='flex gap-2 items-center' onClick={addTokenCallback}>
                <img src="/images/icons/metamask.png" alt="" style={{ width: '20px', height: '20px' }}></img>
                <span className='text-[14px] text-white font-medium'>Add <span className='text-white'>$CACO</span> to Metamask</span>
              </button>
              <ConnectWallet />
            </div>
          </Reveal>
        </div>
        <div className='app-content'>
          <PresaleBody />
        </div>
      </div>
    </div>
  )
}
export default Presale;