import UIKit

enum Theme {
	// Brand (User palette)
	static let brandPrimary = UIColor(red: 7/255.0, green: 45/255.0, blue: 81/255.0, alpha: 1.0) // #072D51
	static let gold = UIColor(red: 207/255.0, green: 169/255.0, blue: 104/255.0, alpha: 1.0) // #CFA968
	static let brandSecondary = UIColor(red: 205/255.0, green: 210/255.0, blue: 197/255.0, alpha: 1.0) // #CDD2C5

	// Surfaces
	static let incomingBubble = brandSecondary
	static let outgoingBubble = brandPrimary

	// Text
	static let textPrimary = UIColor.label
	static let textMuted = UIColor.secondaryLabel
	static let outgoingText = UIColor.white
	static let outgoingMuted = UIColor.white.withAlphaComponent(0.85)
	static let incomingText = UIColor.label
	static let incomingMuted = UIColor.secondaryLabel

	// Accents
	static let receiptRead = gold
}
