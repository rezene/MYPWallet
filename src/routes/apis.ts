import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// In-memory storage for items
let items: { id: number; name: string }[] = [];

// GET /items - Fetch all items
router.get('/', (req: Request, res: Response) => {
    console.log(req.body);
    res.json(items);
});

// POST /items - Add a new item
router.post('/', (req: Request, res: Response) => {
    const newItem = {
        id: items.length + 1,
        name: req.body.name,
    };
    items.push(newItem);
    res.status(201).json(newItem);
});

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

export default router;