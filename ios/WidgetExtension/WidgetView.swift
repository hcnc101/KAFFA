import WidgetKit
import SwiftUI

struct CoffeeClockWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "CoffeeClockWidget",
            provider: CoffeeClockTimelineProvider()
        ) { entry in
            CoffeeClockWidgetView(entry: entry)
        }
        .configurationDisplayName("Coffee Clock")
        .description("Track your caffeine levels")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct CoffeeClockWidgetView: View {
    let entry: CoffeeClockEntry
    
    var body: some View {
        VStack {
            Text(entry.currentTime)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.brown)
            
            Text("\(entry.caffeineLevel, specifier: "%.0f")mg")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.orange)
            
            Text("Active Caffeine")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding()
        .background(Color.white)
    }
} 