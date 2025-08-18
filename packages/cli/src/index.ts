#!/usr/bin/env node

/**
 * Entry point for the Whimbrel CLI application.
 *
 * Sets up the command parser and registers available commands.
 */
import { Command } from 'commander'
import { addCommands } from './command'

const program = new Command()

addCommands(program)

program.parse()
