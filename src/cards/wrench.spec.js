const Ava = require('ava')
const Sinon = require('sinon')

const { getCard } = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should cause a player to miss 2 turns', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const wrench = getCard('wrench')
  player1.hand.push(wrench)

  game.play(player1, wrench)
  t.true(announceCallback.calledWith('player:played'))

  game.pass(player2)
  t.true(announceCallback.calledWith('card:wrench:contact'))
  t.is(player1.hand.length, player1.maxHand)
  t.is(game.discardPile.length, 0)
  t.is(game.turns, 2)

  game.incrementTurn()
  t.is(game.turns, 4)
  t.is(game.discardPile.length, 1)
  t.truthy(find(game.discardPile, wrench))
})

Ava.test('should discard if the affected player is removed', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const wrench = getCard('wrench')
  player1.hand.push(wrench)

  game.play(player1, wrench)
  game.pass(player2)
  game.removePlayer(player2)

  t.is(game.discardPile.length, player2.maxHand + 1)
  t.truthy(find(game.discardPile, wrench))
})

Ava.test('should have a conditional weight', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  const wrench = getCard('wrench')
  player1.hand = [wrench]
  let plays = wrench.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 1.5)
  })
  player2.conditionCards.push(getCard('deflector'))
  plays = wrench.validPlays(player1, player2, game)
  plays.forEach((play) => {
    t.is(play.weight, -1.5)
  })
})

Ava.test('should have less weight in a larger game', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, player2] = game.players
  const wrench = getCard('wrench')
  player1.hand = [wrench]
  let plays = wrench.validPlays(player1, player2, game)
  t.true(Array.isArray(plays))
  t.truthy(plays.length)
  plays.forEach((play) => {
    t.true(Array.isArray(play.cards))
    t.truthy(play.cards.length)
    t.is(typeof play.weight, 'number')
    t.is(play.weight, 1)
  })
  player2.conditionCards.push(getCard('deflector'))
  plays = wrench.validPlays(player1, player2, game)
  plays.forEach((play) => {
    t.is(play.weight, -1)
  })
})
