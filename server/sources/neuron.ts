/**
 * 信息流源：Neuron —— 细胞 Press：神经科学顶级期刊
 * 通过 defineSource 声明，返回统一的 NewsItem 列表
 */
import { defineJournalSource } from "../utils/journal"

// Neuron
export default defineJournalSource("Neuron", "https://rss.sciencedirect.com/publication/science/08966273")
