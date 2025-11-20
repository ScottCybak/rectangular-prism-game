# Rectangular Prism Game

Alright, we've pushed this as far as i think.  The complexity of the number of shapes on screen is scaling worse then i thought.  We did learn some stuff, so not all is lost.

1. Trying to manage y/z is a pain in the ass
2. Our Watched needs some work - and is it worth it if we just bring in rxjs or something similar?
3. Intersectional calculations are killing us, even when we attempt to reduce the number of candidates to check.
4. This DOES have some use cases, but keyboard and high fps tick based input delay is expensive, as we suspected.

## So, what does this mean?

Deprecation!

## Controls

`WASD` to move

`SHIFT` to move faster

`Mouse wheel up/down` to zoom in/out

`Escape` nothing yet

## Have to have's
- experiment with loading another world (or, just unloading) and see what we need to do for destructuring, it'll probably tease out a lot of orphaned watched/listeners
- collision based movement modifier -> eg, running into a object on an angle would let you continue in the non constricted direction?

## Tchotchkes
- pause/menu - the keymap can technically get remapped to other keys
- warp points (step on a predefined area, get teleported to another)
- player elevation change, with or without shifting perspective/zoom?
- jumping?
- chunk the map into tiles, to reduce/remove offscreen calculations
- object sounds, maybe with proximity
- dynamic lighting/shadows?  day night cycle? /shrug

