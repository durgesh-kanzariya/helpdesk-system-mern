const Ticket = require('../models/Ticket');

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (Logged-in user)
const createTicket = async (req, res) => {
    try {
        const { title, description, priority, category } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const ticket = await Ticket.create({
            title,
            description,
            priority: priority || 'medium',
            category: category || 'general',
            createdBy: req.user._id,
        });

        // Populate createdBy details before returning
        const populatedTicket = await Ticket.findById(ticket._id).populate('createdBy', 'name email');

        res.status(201).json(populatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error creating ticket' });
    }
};

// @desc    Get all tickets (Admin sees all; User sees only their own)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
    try {
        let query = {};

        // Regular users can only see their own tickets
        if (req.user.role !== 'admin') {
            query.createdBy = req.user._id;
        }

        // Optional status or priority filters from query string (e.g. ?status=open)
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.priority) {
            query.priority = req.query.priority;
        }
        if (req.query.category) {
            query.category = req.query.category;
        }

        const tickets = await Ticket.find(query)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error fetching tickets' });
    }
};

// @desc    Get a single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Regular users can only view their own ticket
        if (
            ticket.createdBy._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized to view this ticket' });
        }

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error fetching ticket' });
    }
};

// @desc    Update a ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Permission check
        const isOwner = ticket.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this ticket' });
        }

        // If regular user: restrict what they can modify (cannot assign to themselves or others)
        const allowedUpdates = {};
        if (isAdmin) {
            if (req.body.title !== undefined) allowedUpdates.title = req.body.title;
            if (req.body.description !== undefined) allowedUpdates.description = req.body.description;
            if (req.body.priority !== undefined) allowedUpdates.priority = req.body.priority;
            if (req.body.status !== undefined) allowedUpdates.status = req.body.status;
            if (req.body.category !== undefined) allowedUpdates.category = req.body.category;
            if (req.body.assignedTo !== undefined) allowedUpdates.assignedTo = req.body.assignedTo;
        } else {
            // Regular user can edit title, description, priority, category, or close their ticket
            if (req.body.title !== undefined) allowedUpdates.title = req.body.title;
            if (req.body.description !== undefined) allowedUpdates.description = req.body.description;
            if (req.body.priority !== undefined) allowedUpdates.priority = req.body.priority;
            if (req.body.category !== undefined) allowedUpdates.category = req.body.category;

            if (req.body.status !== undefined) {
                if (req.body.status === 'closed') {
                    allowedUpdates.status = 'closed';
                } else {
                    return res.status(400).json({ message: 'Users can only mark their ticket as closed' });
                }
            }
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        )
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email');

        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error updating ticket' });
    }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Admin only)
const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        await Ticket.findByIdAndDelete(req.params.id);

        res.json({ message: 'Ticket removed successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error deleting ticket' });
    }
};

module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    deleteTicket,
};
