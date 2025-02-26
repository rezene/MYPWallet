import { Router, Request, Response, NextFunction } from 'express';

//import { MnemonicStrategySelector } from '../BTC/walletGenerationStrategies/mnemonic/mnemonicStrategySelector.js';
//import { EntropyStrategySelector } from '../BTC/walletGenerationStrategies/entropy/entropyStrategySelector.js';
import {EntropyMYPStrategySelector} from '../BTC/walletGenerationStrategies/entropyMYP/entropyMYPStrategySelector.js';
import { EntropyStrategySelector } from '../BTC/walletGenerationStrategies/entropy/entropyStrategySelector.js';
import { BitcoinServiceInterface } from '../BTC/interfaces/BitcoinServiceInterface.js';
import { xPrivStrategySelector } from '../BTC/walletGenerationStrategies/xPriv/xPrivStrategySelector.js';
import { MnemonicStrategySelector } from '../BTC/walletGenerationStrategies/mnemonic/mnemonicStrategySelector.js';

const myp2 = 'f0bZbra0kgyjUdwQLG1xWhtjN6iIScWbjscaeZlvP8ioc8mo1SgXSELgS6ScF1cL74NEDntXp9go38fwlQSHwstP6iSy0UIEJyq6wt0G4IpssDeIop8douXzw5doC4eG'

const router = Router();

// In-memory storage for items
let items: { id: number; name: string }[] = [];

router.post('/balance', async (req: Request, res: Response) =>  {
    const entropy=req.body.entropy;
    const role=req.body.role;
    let service;
    if (role==='Entropy')
   service= new BitcoinServiceInterface(entropy, EntropyStrategySelector);
    else if (role=='xPriv')
    service= new BitcoinServiceInterface(entropy, xPrivStrategySelector);
   else if (role==='Seed Phrase')
    service= new BitcoinServiceInterface(entropy, MnemonicStrategySelector);
   else
    service= new BitcoinServiceInterface(entropy, EntropyMYPStrategySelector);
 
    try {
    const balance=await service.getTotalWalletBallance();
        res.json({ balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/derived-address', async (req: Request, res: Response) => {
    const entropy=req.body.entropy;
    const role=req.body.role;
    //if (!entropy || entropy.length !== 128)
    //res.status(403).json({ error: 'Not valid entropy' });

    let service;
    if (role==='Entropy')
   service= new BitcoinServiceInterface(entropy, EntropyStrategySelector);
    else if (role=='xPriv')
    service= new BitcoinServiceInterface(entropy, xPrivStrategySelector);
    else if (role==='Seed Phrase')
        service= new BitcoinServiceInterface(entropy, MnemonicStrategySelector);
   else 
    service= new BitcoinServiceInterface(entropy, EntropyMYPStrategySelector);
 
    const derivedAddress=await service.getRecevingAddress();
    res.json({derivedAddress});
});

router.post('/transfer', async (req: Request, res: Response) => {
    const entropy=req.body.entropy;
    const role=req.body.role;
    let service;
    if (role==='Entropy')
   service= new BitcoinServiceInterface(entropy, EntropyStrategySelector);
    else if (role=='xPriv')
    service= new BitcoinServiceInterface(entropy, xPrivStrategySelector);
    else if (role==='Seed Phrase')
        service= new BitcoinServiceInterface(entropy, MnemonicStrategySelector);
   else
    service= new BitcoinServiceInterface(entropy, EntropyMYPStrategySelector);
 
    const response=await service.transferBitCoin(req.body.address, req.body.amount);
    res.status(201).json(response);

});

router.post('/transactions', async (req: Request, res: Response) => {
    const entropy=req.body.entropy;
    const role=req.body.role;
    let service;
    if (role==='Entropy')
   service= new BitcoinServiceInterface(entropy, EntropyStrategySelector);
    else if (role=='xPriv')
    service= new BitcoinServiceInterface(entropy, xPrivStrategySelector);
    else if (role==='Seed Phrase')
        service= new BitcoinServiceInterface(entropy, MnemonicStrategySelector);
   else
    service= new BitcoinServiceInterface(entropy, EntropyMYPStrategySelector);
 
    const response=await service.getTransactions();
    res.status(201).json(response);

});


router.post('/mnemonics', async (req: Request, res: Response) => {
    const entropy=req.body.entropy;
    let service;
   service= new BitcoinServiceInterface(entropy, EntropyStrategySelector);
    const mnemonics=await service.getMnemonics(entropy);
    res.status(201).json({mnemonics});

});
/*
// GET /items/:id - Fetch a specific item by ID
router.get('/:id', (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    const item = items.find((i) => i.id === itemId);
    if (!item) {
        res.status(404).json({ message: 'Item not found' });
    } else {
        res.json(item);
    }
});

// PUT /items/:id - Update an item by ID
router.put('/:id', (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    const item = items.find((i) => i.id === itemId);
    if (!item) {
        res.status(404).json({ message: 'Item not found' });
    } else {
        item.name = req.body.name;
        res.json(item);
    }
});

// DELETE /items/:id - Delete an item by ID
router.delete('/:id', (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    const index = items.findIndex((i) => i.id === itemId);
    if (index === -1) {
        res.status(404).json({ message: 'Item not found' });
    } else {
        items.splice(index, 1);
        res.status(204).send();
    }
});
*/
export default router;