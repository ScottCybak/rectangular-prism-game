# Game Engine

I'm not 100% sure where this is going yet, but it's turning into something.

## Controls

`WASD` to move

`SHIFT` to move faster

## Have to have's
- experiment with loading another world (or, just unloading) and see what we need to do for destructuring, it'll probably tease out a lot of orphaned watched/listeners
- collision based movement modifier -> eg, running into a object on an angle would let you continue in the non constricted direction?
- leaving the screen for a while, seems to tear when it comes back - haven't tried to reproduce, but it needs investigation

## Tchotchkes
- pause/menu - the keymap can technically get remapped to other keys
- warp points (step on a predefined area, get teleported to another)
- player elevation change, with or without shifting perspective/zoom?
- jumping?
- chunk the map into tiles, to reduce/remove offscreen calculations
- object sounds, maybe with proximity
- dynamic lighting/shadows?  day night cycle? /shrug

