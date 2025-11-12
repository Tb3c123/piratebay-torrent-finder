'use client'

// UI Components Test & Documentation
// This file demonstrates usage of all UI components

import React from 'react'
import {
    Button,
    Input,
    Card,
    Modal,
    Spinner,
    Alert,
    Badge
} from '@/components/ui'

export default function UIComponentsDemo() {
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white mb-8">
                    UI Components Library
                </h1>

                {/* Buttons */}
                <Card variant="bordered">
                    <Card.Header>
                        <h2 className="text-2xl font-bold text-white">Buttons</h2>
                    </Card.Header>
                    <Card.Body>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <Button variant="primary">Primary Button</Button>
                                <Button variant="secondary">Secondary Button</Button>
                                <Button variant="danger">Danger Button</Button>
                                <Button variant="ghost">Ghost Button</Button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button size="sm">Small</Button>
                                <Button size="md">Medium</Button>
                                <Button size="lg">Large</Button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button loading>Loading...</Button>
                                <Button disabled>Disabled</Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Inputs */}
                <Card variant="bordered">
                    <Card.Header>
                        <h2 className="text-2xl font-bold text-white">Inputs</h2>
                    </Card.Header>
                    <Card.Body>
                        <div className="space-y-4 max-w-md">
                            <Input
                                label="Username"
                                placeholder="Enter username"
                                helperText="Choose a unique username"
                            />
                            <Input
                                type="email"
                                label="Email"
                                placeholder="Enter email"
                                error="Invalid email address"
                            />
                            <Input
                                type="password"
                                label="Password"
                                placeholder="Enter password"
                            />
                            <Input
                                placeholder="Search..."
                                leftIcon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                }
                            />
                        </div>
                    </Card.Body>
                </Card>

                {/* Cards */}
                <Card variant="elevated">
                    <Card.Header>
                        <h2 className="text-2xl font-bold text-white">Cards</h2>
                    </Card.Header>
                    <Card.Body>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card variant="default">
                                <h3 className="text-lg font-semibold text-white mb-2">Default Card</h3>
                                <p className="text-gray-400">This is a default card</p>
                            </Card>
                            <Card variant="bordered">
                                <h3 className="text-lg font-semibold text-white mb-2">Bordered Card</h3>
                                <p className="text-gray-400">This is a bordered card</p>
                            </Card>
                            <Card variant="elevated">
                                <h3 className="text-lg font-semibold text-white mb-2">Elevated Card</h3>
                                <p className="text-gray-400">This is an elevated card</p>
                            </Card>
                        </div>
                    </Card.Body>
                </Card>

                {/* Modal */}
                <Card variant="bordered">
                    <Card.Header>
                        <h2 className="text-2xl font-bold text-white">Modal</h2>
                    </Card.Header>
                    <Card.Body>
                        <Button onClick={() => setIsModalOpen(true)}>
                            Open Modal
                        </Button>
                        <Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Example Modal"
                            footer={
                                <div className="flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                                        Confirm
                                    </Button>
                                </div>
                            }
                        >
                            <p className="text-gray-300">
                                This is a modal dialog. It supports different sizes, titles, footers,
                                and can be closed by clicking the backdrop or pressing ESC.
                            </p>
                        </Modal>
                    </Card.Body>
                </Card>

                {/* Spinners */}
                <Card variant="bordered">
                    <Card.Header>
                        <h2 className="text-2xl font-bold text-white">Spinners</h2>
                    </Card.Header>
                    <Card.Body>
                        <div className="flex flex-wrap items-center gap-6">
                            <Spinner size="sm" />
                            <Spinner size="md" />
                            <Spinner size="lg" />
                            <Spinner size="md" color="white" />
                            <Spinner size="md" text="Loading..." />
                        </div>
                    </Card.Body>
                </Card>

                {/* Alerts */}
                <Card variant="bordered">
                    <Card.Header>
                        <h2 className="text-2xl font-bold text-white">Alerts</h2>
                    </Card.Header>
                    <Card.Body>
                        <div className="space-y-4">
                            <Alert
                                type="success"
                                title="Success!"
                                message="Your action was completed successfully."
                                dismissible
                            />
                            <Alert
                                type="error"
                                title="Error"
                                message="Something went wrong. Please try again."
                                dismissible
                            />
                            <Alert
                                type="warning"
                                title="Warning"
                                message="Please review your input before proceeding."
                            />
                            <Alert
                                type="info"
                                message="This is an informational message."
                            />
                        </div>
                    </Card.Body>
                </Card>

                {/* Badges */}
                <Card variant="bordered">
                    <Card.Header>
                        <h2 className="text-2xl font-bold text-white">Badges</h2>
                    </Card.Header>
                    <Card.Body>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge color="blue">Blue</Badge>
                                <Badge color="green">Green</Badge>
                                <Badge color="yellow">Yellow</Badge>
                                <Badge color="red">Red</Badge>
                                <Badge color="gray">Gray</Badge>
                                <Badge color="purple">Purple</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge size="sm">Small</Badge>
                                <Badge size="md">Medium</Badge>
                                <Badge size="lg">Large</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge color="green" icon={
                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                }>
                                    Verified
                                </Badge>
                                <Badge color="purple" icon={
                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                }>
                                    VIP
                                </Badge>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    )
}
