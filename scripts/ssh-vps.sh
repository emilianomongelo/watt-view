#!/bin/bash
# Quick SSH to VPS for watt-view management
ssh -o StrictHostKeyChecking=no reflex "$@"
