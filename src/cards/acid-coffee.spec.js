const Ava = require('ava')
const Sinon = require('sinon')

const Deck = require('../deck')
const Junkyard = require('../junkyard')
const { find } = require('../util')

Ava.test('should make a player miss a turn', (t) => {
  const announceCallback = Sinon.spy()
  const game = new Junkyard('player1', 'Jay', announceCallback)
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('acid-coffee'))

  game.play(player1.id, [Deck.getCard('acid-coffee')])
  game.pass(player2.id)
  t.is(player2.hp, player2.maxHp - 3)
  t.is(game.turns, 2)
})

Ava.test('should delay discarding', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.addPlayer('player3', 'Jimbo')
  game.start()
  const [player1, , player3] = game.players
  player1.hand.push(Deck.getCard('acid-coffee'))

  game.play(player1.id, [Deck.getCard('acid-coffee')], player3.id)
  t.is(player1.hand.length, player1.maxHand)

  game.pass(player3.id)
  t.is(game.discardPile.length, 0)

  game.incrementTurn()
  t.is(game.discardPile.length, 1)
})

Ava.test('should discard even in the event of death', (t) => {
  const game = new Junkyard('player1', 'Jay')
  game.addPlayer('player2', 'Kevin')
  game.start()
  const [player1, player2] = game.players
  player1.hand.push(Deck.getCard('acid-coffee'))
  player2.hp = 3

  game.play(player1.id, [Deck.getCard('acid-coffee')])
  t.is(player1.hand.length, player1.maxHand)

  game.pass(player2.id)
  t.truthy(game.stopped)
  t.is(game.discardPile.length, player2.maxHand + 1)
  t.truthy(find(game.discardPile, Deck.getCard('acid-coffee')))
})