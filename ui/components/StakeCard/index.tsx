// Copyright Tippers 🎲🃏 2022
// 17 U.S.C §§ 101-1511

// importing relevant modules;
import React, { useEffect, useState } from 'react';
import { Typography } from '../../atoms/Typography';
import { alert, close } from '../../../store/alert/alert.modal.reducer';
import { RootState } from '../../../store/store';
import {useDispatch, useSelector} from 'react-redux';
import { flip, getRequestId, 
	     getResult, roll, 
		 getDiceRequestId, getDiceResult,
		 spinWheel, getWheelRequestId, 
		 getWheelResult
		} from '../../../utils/interact';


// importing stylings from styled-component
import {
	ActionButton,
	CardBody,
	CardHead,
	InputGroup,
	OutcomeWrapper,
	ResultOutcome,
	ResultWrapper,
	SelectedStake,
	StakeGroup
} from './index.styled';


// staked card props types
export interface StakeCardProps {
	show: boolean;
	coin: string;
	stake: string;
	result: string;
	stakes: string[];
	setCoin: (arg: string) => void;
	setStake: (arg: string) => void;
	onSpin: () => void;
	again: () => void;
	currencies: string[];
	game: 'wheel' | 'dice' | 'coins';
	connected: boolean;
	spin: boolean;
	payout: number;
	setPayout: (arg: number) => void;
}

// JSX Component
const StakeCard = (props: StakeCardProps): JSX.Element => {
	const {
		show,
		coin,
		setCoin,
		stake,
		stakes,
		setStake,
		again,
		onSpin,
		game,
		result,
		currencies,
		connected,
		spin,
		payout,
		setPayout
	} = props;

	// dispatch an action to redux
	const dispatch = useDispatch();

	// initial state 
	const [outcome, setOutcome]:any = useState([]);
	const [chosenOutcome, setChosenOutcome] = useState(game === 'wheel' ? 'wheel' : '');
	// console.log(stake, connected, game, result);
	// set disabled
	const [disabled, setDisabled] = useState(false);

	//set address
	const address = useSelector((state:RootState)=> state.address.address)

	// result
	useEffect(() => {
		console.log(coin, 'coin')
		if (game.includes('wheel')) {
			setPayout(parseFloat(result) * parseInt(stake));
		} else if (game.includes('coins')) {
			if (chosenOutcome.includes(result)) {
				setPayout(parseInt(stake) * 2);
			} else {
				setPayout(parseInt(stake) * 0);
			}
		} else if (game.includes('dice')) {
			// console.log('chosen', chosenOutcome);
			if (chosenOutcome.includes('greater') && Number(result) > 6) {
				setPayout(parseInt(stake) * 2);
				console.log(payout, 'payout')
			} else if(chosenOutcome.includes('less') && Number(result) < 6){
				setPayout(parseInt(stake) * 2);
			} else {
				setPayout(parseInt(stake) * 0);
			}
		}
	}, [result]);

	//
	useEffect(() => {
		if (game.includes('dice')) {
			setOutcome(['greater than 6', 'less than 6']);
		} else {
			setOutcome(['heads', 'tails']);
		}
	}, []);

	// button text
	const buttonText = (arg : any) => {
		if (arg.includes('wheel')) {
			return 'spin';
		} else if (arg.includes('dice')) {
			return 'roll';
		} else {
			return 'toss';
		}
	};

	// button action
	const spinGame = async () => {
		console.log(game);
		if(!address) {
			dispatch(alert('connect your wallet'));
			setTimeout(() => {
				dispatch(close(""))
			  }, 2000)
		 return;
		}
       else if(!stake.length) {
			dispatch(alert('select an amount'));
			setTimeout(() => {
				dispatch(close(""))
			  }, 2000)
		 return;
		} else if (!chosenOutcome.length) {
			dispatch(alert('place a bet'));
			setTimeout(() => {
				dispatch(close(""))
			  }, 2000)
		 return;
		} 
	 if(game.includes('coins')) {
		const bet:number = chosenOutcome.includes('head') ? 1 : 0
		const result= await flip(bet, Math.round(Number(stake)*10**15), address)
		const id = await getRequestId(bet)
		console.log(id, 'id')
		setTimeout(async ()=> {
			console.log(id, 'id contract')
			await getResult(id, dispatch)
			onSpin();
			setDisabled(false);
		}, 40000)
		setDisabled(true);	
		} else if (game.includes('dice')) {
            const bet:number = chosenOutcome.includes('greater') ? 0 : 1
			const result= await roll(bet, Math.round(Number(stake)*10**15), address)
		const id = await getDiceRequestId(bet)
		console.log(id, 'id')
		setTimeout(async ()=> {
			console.log(id, 'id contract')
			await getDiceResult(id, dispatch)
			onSpin();
			setDisabled(false);
		}, 40000)
		setDisabled(true);	
		} else if(game.includes('wheel')) {
			const result= await spinWheel(Math.round(Number(stake)*10**15), address)
		const id = await getWheelRequestId()
		console.log(id, 'id')
		setTimeout(async ()=> {
			console.log(id, 'id contract')
			await getWheelResult(id, dispatch)
			onSpin();
			setDisabled(false);
		}, 40000)
		setDisabled(true);	
		}
	}

	// JSX Building block
	return (
		<>
			<CardHead>
				<Typography variant="p">
					stake <br /> amount
				</Typography>
				{!show ? (
					<button 
					 type='button'
					 defaultValue={coin}
					 onClick={(e: any) => setCoin(e.target.value)}
                     onBlur={(e : any) => setCoin(e.target.value)}>
				    {currencies.length
							? currencies.map((e) => (
								<span key={e}>{e}</span>
							  ))
					: null}
                    <img src='/assets/matic1.png' />
					</button>		
					
				) : (
					<SelectedStake>{stake}</SelectedStake>
				)}
			</CardHead>
			{!show ? (
				<CardBody>
					<StakeGroup>
						{stakes.length
							? stakes.map((e, index) => (
									<label
										key={index}
										htmlFor={`${e}`}
										style={{ background: stake === e ? '#FF7F40' : 'transparent' }}>
										{e}
										<input
											disabled={spin}
											onChange={() => setStake(e)}
											type="radio"
											name="stake"
											id={`${e}`}
										/>
									</label>
							  ))
							: null}
					</StakeGroup>
					{!game.includes('wheel') ? (
						<OutcomeWrapper>
							<Typography variant="p">outcome</Typography>
							<InputGroup>
								{outcome.length
									? outcome.map((e : any, index : any) => (
											<label
												key={index}
												htmlFor={`${e}`}
												style={{ color: chosenOutcome === e ? '#FF7F40' : 'white' }}>
												{e}
												<input
													onChange={() => setChosenOutcome(e)}
													type="radio"
													name="outcome"
													id={`${e}`}
													disabled={spin}
												/>
											</label>
									  ))
									: null}
							</InputGroup>
						</OutcomeWrapper>
					) : null}
					<ActionButton
					    disabled={disabled}
						spin={spin}
						onClick={spinGame}>
						{buttonText(game)}
					</ActionButton>
				</CardBody>
			) : (
				<ResultWrapper>
					<Typography variant="p">
					  Result: {result}	
						{game === 'wheel' && 'x'}
					</Typography>
					{payout !== 0 ? (
						<Typography variant="p">
							<span style={{
								display: 'flex',
								alignItems: "center",
							}}>payment: {payout} {coin} 
							<img src='/assets/matic1.png'style={{
								width: "2rem",
								marginLeft: "-5px"
								// marginTop: "1rem"
							}}/>
							<a href="/">(Polygonscan)</a>
							</span>
						</Typography>
					) : (
						<Typography variant="p">
					  <span style={{
						  textTransform : "capitalize",
						  color: "red"
					  }}> unfortunately, you didn't win this round!</span>
				  </Typography>
					)}
					{!game.includes('wheel') && (
						<ResultOutcome>
							<Typography variant="p">chosen Outcome</Typography>
							<Typography variant="p">{chosenOutcome}</Typography>
						</ResultOutcome>
					)}
					<ActionButton onClick={again} inverse={true} disabled={disabled}>
						{payout === 0 ? 'try again' : 'play again'}
					</ActionButton>
				</ResultWrapper>
			)}
		</>
	);
};

export default StakeCard;
